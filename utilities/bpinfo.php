<?php

class eosBPinfo {
    public $postdata = '{"json":true, "scope":"eosio", "code":"eosio", "table":"producers", "limit":500 }';
    public $url = "https://eu.eosdac.io/v1/chain/get_table_rows";
    public $debug = false;

    public function getTop21BP()
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL,$this->url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $this->postdata);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $output = curl_exec ($ch);
        curl_close ($ch);

        $d = json_decode($output);

        usort($d->rows, function($first,$second){
            return $first->total_votes < $second->total_votes;
        });

        $top21 = array_slice($d->rows, 0, 21);
        // print_r($top21);
        $alljson = array();
        foreach ($top21 as $bp){
            $json_file = @file_get_contents($bp->url.'/bp.json');
            if ($json_file !== false) {
                $bpdata = json_decode($json_file,true);
            }
            array_push($alljson, $bpdata);
            // echo $bp->url.'/bp.json<br>';
        }
        // echo json_encode($alljson);
        //echo count($alljson);
        //print_r($alljson);
        return $alljson;
    }

    public function getPublicNodes($bpdata)
    {
        $public_nodes = array();
        foreach ($bpdata as $bpindex => $bp) {
            if ($this->debug) {
                print "==== " . $bp['producer_account_name'] . " ====\n";
            }
            $public_node = '';
            if (array_key_exists('nodes', $bp)) {
                foreach ($bp['nodes'] as $nodeindex => $node) {
                    if ($public_node == "" && array_key_exists('ssl_endpoint', $node) && $node['ssl_endpoint'] != '') {
                        $public_node = $node['ssl_endpoint'];
                    }
                    if ($public_node == "" && array_key_exists('api_endpoint', $node) && $node['api_endpoint'] != '') {
                        $public_node = $node['api_endpoint'];
                    }
                }
            }
            if ($public_node != '') {
                $public_node = strip_tags($public_node);
                if (substr($public_node, 0,4) != 'http') {
                    $public_node = 'http://' . $public_node;
                }
                $public_nodes[] = $public_node;
            }
            if ($this->debug) {
                print $public_node . "\n";
            }
        }
        return $public_nodes;
    }
}

$bpinfo = new eosBPinfo();
$bpdata = $bpinfo->getTop21BP();

// output unified JSON of the top 21 BPs
$bpdata_json = json_encode($bpdata);
$topbps_file = 'topbps.json';
$fp = fopen($topbps_file, 'w');
fwrite($fp,$bpdata_json);
fclose($fp);

// output nodes of the top 21 BPs
$nodes = $bpinfo->getPublicNodes($bpdata);
$nodes_json = json_encode($nodes);
$topnodes_file = 'topnodes.json';
$fp = fopen($topnodes_file, 'w');
fwrite($fp,$nodes_json);
fclose($fp);

//var_dump($nodes);
