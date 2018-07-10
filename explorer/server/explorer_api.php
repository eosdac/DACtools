<?php

$servername = "localhost";
$username = "root";
$password = "xxxxxx";
$db = "eosdac_explorer";

//set up mysql
try {
	    $conn = new PDO("mysql:host=$servername;dbname=$db", $username, $password, array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8') );
	    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	    // $conn->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, false);
}
catch(PDOException $e){
    	echo "Connection failed: " . $e->getMessage();
}

//api routing
if (isset($_GET['get'])) {

    switch ($_GET['get']) {
 
        case 'tokenstats':
            $stmt = $conn->prepare('SELECT ( SELECT COUNT(*) FROM transfers ) AS tot_transfers, ( SELECT COUNT(*) FROM balances WHERE balance > 0 ) AS tot_hodlers, (SELECT SUM(balance) FROM balances )AS tot_bal_db ');
            break;

        case 'hodlers':
            $stmt = $conn->prepare('SELECT * FROM balances ORDER BY balance DESC LIMIT 300 ');
            break;
        case 'transfers':
        	$stmt = $conn->prepare('SELECT * FROM transfers ORDER BY account_action_seq DESC LIMIT 500 ');
            break;
        case 'accounttransfers':
        	if (isset($_GET['account'])) {
        		$account = $_GET['account'];
        		// echo $account;
        		$stmt = $conn->prepare('SELECT * FROM transfers WHERE _from="'.$account.'" OR _to="'.$account.'" '. 'ORDER BY account_action_seq DESC LIMIT 1000');

        	}
            break;
        case '3':
            echo "three";
            break;
    }
}




$stmt->execute();
// set the resulting array to associative
$result = $stmt->fetchALL(PDO::FETCH_OBJ);
header('Content-Type: application/json');
echo json_encode($result);
?>

