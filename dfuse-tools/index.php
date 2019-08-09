<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Table Scope Checking Tool</title>

<style>
table {
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

table td, table th {
  border: 1px solid #ddd;
  padding: 8px;
}

table tr:nth-child(even){background-color: #f2f2f2;}

table tr:hover {background-color: #ddd;}

table th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #4CAF50;
  color: white;
}
</style>

  </head>
  <body>

<?php
error_reporting(E_ALL); ini_set('display_errors', 1);

include 'includes/functions.php';

$api_credentials = authenticateDFuse();

$cache_file_name = __DIR__ . '/cache/last_cache_update.txt';
$last_cache_update = @file_get_contents($cache_file_name);
$update_cache = false;
if ($last_cache_update) {
    if (isset($_GET['refresh']) && $_GET['refresh'] == 1) {
        if ((time() - $last_cache_update) > 3600) {
            $update_cache = true;
            print "<br /><strong>Cache updated.</strong><br />";
        } else {
            print "<br /><strong>Error: You can only update the cache every hour.</strong><br />";
        }
    }
} else {
    $update_cache = true;
}
if ($update_cache) {
    clearEmptyCacheFiles();
    $last_cache_update = time();
    file_put_contents($cache_file_name,$last_cache_update);
}

$CachedDate = new DateTime();
$CachedDate->setTimestamp($last_cache_update);
print "Data last updated: <strong>" . $CachedDate->format('Y-m-d H:i:s T') . "</strong><br /><br />";

print "To check data as a specific block number, include old_block_num and new_block_num GET attributes.<br />";

$old_block_num = 0;
if (isset($_GET['old_block_num'])) {
	$old_block_num = $_GET['old_block_num'];
}
$new_block_num = 0;
if (isset($_GET['new_block_num'])) {
	$new_block_num = $_GET['new_block_num'];
}

$network = "jungle";
print "<h1>Jungle Test</h1>";

$contract = "kasdactokens";
$old_scope = $contract;
$new_scope = "eos.dac";
$table = "members";
checkData($contract,$table,$old_scope,$old_block_num,$new_scope,$new_block_num,$api_credentials['token']);
$table = "memberterms";
checkData($contract,$table,$old_scope,$old_block_num,$new_scope,$new_block_num,$api_credentials['token']);

$contract = "dacelections";
$old_scope = $contract;
$table = "candidates";
checkData($contract,$table,$old_scope,$old_block_num,$new_scope,$new_block_num,$api_credentials['token']);
$table = "custodians";
checkData($contract,$table,$old_scope,$old_block_num,$new_scope,$new_block_num,$api_credentials['token']);
$table = "state";
checkData($contract,$table,$old_scope,$old_block_num,$new_scope,$new_block_num,$api_credentials['token']);
$table = "votes";
checkData($contract,$table,$old_scope,$old_block_num,$new_scope,$new_block_num,$api_credentials['token']);

$network = "mainnet";
print "<h1>Mainnet Test</h1>";

$contract = "eosdactokens";
$old_scope = $contract;
$new_scope = "eos.dac";
$table = "members";
checkData($contract,$table,$old_scope,$old_block_num,$new_scope,$new_block_num,$api_credentials['token']);
$table = "memberterms";
checkData($contract,$table,$old_scope,$old_block_num,$new_scope,$new_block_num,$api_credentials['token']);

$contract = "daccustodian";
$old_scope = $contract;
$table = "candidates";
checkData($contract,$table,$old_scope,$old_block_num,$new_scope,$new_block_num,$api_credentials['token']);
$table = "custodians";
checkData($contract,$table,$old_scope,$old_block_num,$new_scope,$new_block_num,$api_credentials['token']);
$table = "state";
checkData($contract,$table,$old_scope,$old_block_num,$new_scope,$new_block_num,$api_credentials['token']);
$table = "votes";
checkData($contract,$table,$old_scope,$old_block_num,$new_scope,$new_block_num,$api_credentials['token']);

?>
  </body>
</html>