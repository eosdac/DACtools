<?php

function block_time_compare($a, $b)
{
    $t1 = strtotime($a['block_time']);
    $t2 = strtotime($b['block_time']);
    return $t1 - $t2;
}

function pdump($var) {
    print "<textarea rows=\"10\" cols=\"100\">";
    var_dump($var);
    print "</textarea>";
}

function console_log($string) {
    print "<script>console.log(\"" . $string . "\");</script>";
}

// method should be "GET", "PUT", etc..
function request($method, $url, $header, $params) {
    $opts = array(
        'http' => array(
            'method' => $method,
        ),
    );

    // serialize the params if there are any
    if (!empty($params)) {
        if ($method == "GET") {
            $params_array = array();
            foreach ($params as $key => $value) {
                $params_array[] = "$key=".urlencode($value);
            }
            $url .= '?'.implode('&', $params_array);            
        }
        if ($method == "POST") {
            if (is_array($params)) {
                $data = json_encode($params);
            } else {
                $data = $params;
            }
            $opts['http']['content'] = $data;
            $header['Content-Length'] = strlen($data);
        }
    }

    // serialize the header if needed
    if (!empty($header)) {
        $header_str = '';
        foreach ($header as $key => $value) {
            $header_str .= "$key: $value\r\n";
        }
        $header_str .= "\r\n";
        $opts['http']['header'] = $header_str;
    }
    //var_dump($opts);
    //var_dump($url);
    $context = stream_context_create($opts);
    $data = file_get_contents($url, false, $context);
    return $data;
}

function getDateTimeFromBlockTime($block_time_string) {
    $block_time_string_format = "Y-m-d H:i:s";
    $block_time_string = str_replace("T", " ", $block_time_string);
    $block_time_string = str_replace(".5", "", $block_time_string);
    $block_time_string = str_replace("Z", "", $block_time_string);
    $BlockTime = DateTime::createFromFormat($block_time_string_format, $block_time_string);
    return $BlockTime;
}

function getGraphQLResults($q, $table, $token) {
    $json = searchGraphQLCached($q, $table, $token);
    $data = json_decode($json,true);
    $results = $data['data']['searchTransactionsForward']['results'];
    if (count($results)) {
        $cursor = $results[count($results)-1]['cursor'];
        $keep_fetching = true;
        while($keep_fetching) {
            $more_json = searchGraphQLCached($q, $table, $token, $cursor);
            $more_data = json_decode($more_json,true);
            $more_results = $more_data['data']['searchTransactionsForward']['results'];
            $keep_fetching = false;
            if (count($more_results)) {
                $keep_fetching = true;
                $results = array_merge($results,$more_results);
                $cursor = $more_results[count($more_results)-1]['cursor'];
            }
        }
    }
    return $results;
}

function searchGraphQLCached($q, $table, $token, $cursor = '') {
    console_log("searchGraphQLCached: Checking Cache... " . $q . " " . $table . " " . $cursor);
    $filename = __DIR__ . '/../cache/_' . str_replace(array(' ','/'),'-',$q) . '_' . $table . '_' . $cursor . '.json';
    $json = @file_get_contents($filename);
    if ($json) {
        console_log("searchGraphQLCached: Cache Hit!");
        return $json;
    }
    console_log("searchGraphQLCached: Searching...");
    $json = searchGraphQL($q, $table, $token, $cursor);
    file_put_contents($filename,$json);
    return $json;
}

function searchGraphQL($q, $table, $token, $cursor = '', $forward = true) {
    global $network;
    $url = 'https://mainnet.eos.dfuse.io/graphql';
    if ($network == 'jungle') {
        $url = 'https://jungle.eos.dfuse.io/graphql';
    }
    $header = array('Content-Type' => 'application/json');
    $header['Authorization'] = 'Bearer ' . $token;
    $cursor_string = '';
    if ($cursor) {
        $cursor_string = ', cursor: \"' . $cursor . '\"';
    }
    $search_type = 'Forward';
    if (!$forward) {
        $search_type = 'Backward';
        $cursor_string = ', lowBlockNum: 60000000';
    }
    $query = '{"query": "{ searchTransactions' . $search_type . '(query: \"' . $q . ' notif:false\"' . $cursor_string . ') {
        results {
          cursor
          trace {
            id
            block {
              timestamp
            }
            matchingActions {
              account
              name
              data
              authorization {
                actor
              }
              dbOps(table:\"' . $table . '\") {
                oldJSON {
                  object
                }
                newJSON {
                  object
                }
              }
            }
          }
        }
      }
    }"
}';
    $query = str_replace("\n", "", $query);
    $json = request("POST", $url, $header, $query);
    return $json;
}

function getScopedAccountTableDataCached($account, $table, $scope, $block_num, $token, $cursor="") {
    $filename = __DIR__ . '/../cache/_table_data_' . $table . '_' . $account . '_' . $scope . '_' . $block_num . '_' . $cursor . '.json';
    $json = @file_get_contents($filename);
    if ($json) {
        return $json;
    }
    $json = getScopedAccountTableData($account, $table, $scope, $block_num, $token, $cursor);
    file_put_contents($filename,$json);
    return $json;
}

function getScopedAccountTableData($account, $table, $scope, $block_num, $token, $cursor="") {
    global $network;
    console_log("...Updating Cache: _table_data_" . $table . '_' . $account . '_' . $scope . '_' . $block_num . "...");
    $url = 'https://mainnet.eos.dfuse.io/v0/state/table';
    if ($network == 'jungle') {
        $url = 'https://jungle.eos.dfuse.io/v0/state/table';
    }
    $params = array('account' => $account, 'scope' => $scope, 'table' => $table, 'json' => true);
    if ($block_num > 0) {
        $params['block_num'] = $block_num;
    }
    if ($cursor != "") {
        $params['cursor'] = $cursor;
    }
    $header = array('Content-Type' => 'application/json');
    $header['Authorization'] = 'Bearer ' . $token;
    $json = request("GET", $url, $header, $params);
    return $json;
}

function compareData($old_data, $new_data) {
    $count = 0;
    foreach ($old_data['rows'] as $row) {
        $count++;
        $matched = false;
        $result = array();
        foreach ($new_data['rows'] as $new_row) {
            //if ($row['key'] == $new_row['key'] && $row['json']['agreedtermsversion'] == $new_row['json']['agreedtermsversion']) {
            if ($row['key'] == $new_row['key']) {
                //$result = array_diff_assoc($row['json'],$new_row['json']);
                $result = array_diff(array_map('serialize',$row['json']), array_map('serialize',$new_row['json'])); 
                if (count($result) == 0) {
                    $matched = true;
                }
            }
        }
        if (!$matched) {
            print "Not a Match: " . $row['key'] . "\n<br />";
            if (count($result)) {
                print "Data mismatch: ";
                var_dump($result);
                print "\n<br />";
            }

        }
    }
    print $count . " records checked.\n<br />";
}

function checkData($contract,$table,$old_scope,$old_block_num,$new_scope,$new_block_num,$token) {
    print "<h1>Compare (old to new): $contract: $table, old_scope: $old_scope, old_block_num: $old_block_num</h1>";

    $old_json = getScopedAccountTableDataCached($contract, $table, $old_scope, $old_block_num, $token);
    $old_data = json_decode($old_json,true);

    $new_json = getScopedAccountTableDataCached($contract, $table, $new_scope, $new_block_num, $token);
    $new_data = json_decode($new_json,true);

    compareData($old_data, $new_data);

    print "<h1>Compare (new to old): $contract: $table, new_scope: $new_scope, new_block_num: $new_block_num</h1>";

    compareData($new_data, $old_data);   
}

function clearEmptyCacheFiles() {
    $files_to_delete = array(__DIR__ . '/../cache/_table_data_account_.json');
    $dir = new DirectoryIterator(__DIR__ . '/../cache');
    foreach ($dir as $fileinfo) {
        $filename = $fileinfo->getFilename();
        if (!$fileinfo->isDot() && $fileinfo->getExtension() == 'json' && substr($filename, 0, 1) == '_') {
            $delete_file = false;
            $json = file_get_contents(__DIR__ . '/../cache/' . $filename);
            $data = json_decode($json, true);
            if (isset($data['data']['searchTransactionsForward']['results']) && count($data['data']['searchTransactionsForward']['results'] == 0)) {
                $delete_file = true;
            }
            if (isset($data['data']['searchTransactionsBackward']['results']) && count($data['data']['searchTransactionsBackward']['results'] == 0)) {
                $delete_file = true;
            }
            if ($data && array_key_exists('cursor', $data) && $data['cursor'] == '') {
                $delete_file = true;
            }
            if ($delete_file) {
                $files_to_delete[] = __DIR__ . '/../cache/' . $filename;
            }
        }
    }
    foreach ($files_to_delete as $file) {
        @unlink($file);
    }
}

function authenticateDFuse() {
    $filename = __DIR__ . '/../.api_credentials.json';
    $json = file_get_contents($filename) or die("<br/><br/><strong>Authentication file .api_credentials.json not found.</strong>");
    $api_credentials = json_decode($json, true);
    if (time() > $api_credentials['expires_at']) {
        console_log("...Updating DFuse Authentication Token...");
        $url = 'https://auth.dfuse.io/v1/auth/issue';
        $params = array('api_key' => $api_credentials['api_key']);
        $header = array('Content-Type' => 'application/json');
        $json = request("POST", $url, $header, $params);
        if ($json) {
            $new_token = json_decode($json, true);
            if (array_key_exists('token', $api_credentials)) {
                $api_credentials['token'] = $new_token['token'];
                $api_credentials['expires_at'] = $new_token['expires_at'];
                $data = json_encode($api_credentials);
                file_put_contents($filename,$data);
            }
        }
    }
    return $api_credentials;
}