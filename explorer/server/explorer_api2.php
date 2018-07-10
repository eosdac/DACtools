<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require './vendor/autoload.php';

require_once 'vendor/autoload.php';
use Ozdemir\Datatables\Datatables;
use Ozdemir\Datatables\DB\MySQL;

    $config = [ 'host'     => 'localhost',
                'port'     => '3306',
                'username' => 'root',
                'password' => 'xxxxxx',
                'database' => 'eosdac_explorer' ];

    $dt = new Datatables( new MySQL($config) );




 


// //api routing
if (isset($_GET['get'])) {

    switch ($_GET['get']) {
 
        case 'tokenstats':
            $stmt = $conn->prepare('SELECT ( SELECT COUNT(*) FROM transfers ) AS tot_transfers, ( SELECT COUNT(*) FROM balances WHERE balance > 0 ) AS tot_hodlers, (SELECT SUM(balance) FROM balances )AS tot_bal_db ');
            break;

        case 'hodlers':
        	$dt->query('SELECT account,balance, @curRank := @curRank + 1 AS rank FROM balances p, (SELECT @curRank := 0) r WHERE balance > 0 ORDER BY balance DESC');
            // $dt->query('SELECT account, balance FROM balances WHERE balance > 0');
            break;
        case 'transfers':
        	$dt->query('SELECT `account_action_seq`,`_from`,`_to`,`_quantity`,`_symbol`,`_memo`,`txid`,`block_num`,`block_time` FROM transfers');
            break;
        case 'accounttransfers':
        	if (isset($_GET['account'])) {
        		$account = $_GET['account'];
        		// echo $account;
        		$dt->query('SELECT `account_action_seq`,`_from`,`_to`,`_quantity`,`_symbol`,`_memo`,`txid`,`block_num`,`block_time` FROM transfers WHERE _from="'.$account.'" OR _to="'.$account.'" ');

        	}
            break;
        case '3':
            echo "three";
            break;
    }
}


 echo $dt->generate();

 ?>
