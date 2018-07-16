<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$servername = "localhost";
$username = "";
$password = "";
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

            $table= $_GET['get'];
            $page= $_GET['page'];
            $rowsperpage= $_GET['length'];
            
            $search=isset($_GET['filter'])?$_GET['filter']:'';
            $search = trim($search);


        if($table == 'transfers'){

            if($search !=''){
                $where = ' WHERE _to LIKE "%'.$search.'%" OR _from  LIKE "%'.$search.'%" OR txid LIKE "%'.$search.'%"';
            }
            else{
                $where = '';
            }
            
            $stmt = $conn->prepare('SELECT COUNT(*) AS totalrows FROM transfers '.$where);
            $stmt->execute();
            $result = $stmt->fetchALL(PDO::FETCH_OBJ);
            $totalrows = $result[0]->totalrows;

            $offset= ($page-1) * $rowsperpage;
            if($totalrows < $offset){
                $offset=0;
            }
            
        	$stmt = $conn->prepare('SELECT * FROM transfers '.$where.' ORDER BY account_action_seq DESC LIMIT '.$rowsperpage.' OFFSET '.$offset);
            $stmt->execute();
            $result = $stmt->fetchALL(PDO::FETCH_OBJ);

            $json=["totalrows"=>$totalrows, "data"=>$result];
        }

        if($table == 'hodlers'){
            //SELECT account,balance, @curRank := @curRank + 1 AS rank FROM balances p, (SELECT @curRank := 0) r WHERE balance > 0 ORDER BY balance DESC'
            $where ='WHERE balance > 0';
            if($search !=''){
                $where = $where.' AND account LIKE "%'.$search.'%"';
            }

            
            $stmt = $conn->prepare('SELECT COUNT(*) AS totalrows FROM balances '.$where);
            $stmt->execute();
            $result = $stmt->fetchALL(PDO::FETCH_OBJ);
            $totalrows = $result[0]->totalrows;

            $offset= ($page-1) * $rowsperpage;
            if($totalrows < $offset){
                $offset=0;
            }
            
            $stmt = $conn->prepare('SELECT account,balance, @curRank := @curRank + 1 AS rank FROM balances p, (SELECT @curRank := 0) r '.$where.' ORDER BY balance DESC LIMIT '.$rowsperpage.' OFFSET '.$offset);
            $stmt->execute();
            $result = $stmt->fetchALL(PDO::FETCH_OBJ);

            $json=["totalrows"=>$totalrows, "data"=>$result];
        }


        if($table == 'accounttransfers'){

            $where = 'WHERE (_from = "'.$_GET['account']. '" OR _to = "'.$_GET['account'].'") ';
            if($search !=''){
                $where = $where.' AND (_to LIKE "%'.$search.'%" OR _from  LIKE "%'.$search.'%" OR txid LIKE "%'.$search.'%")';
            }

            
            $stmt = $conn->prepare('SELECT COUNT(*) AS totalrows FROM transfers '.$where);
            $stmt->execute();
            $result = $stmt->fetchALL(PDO::FETCH_OBJ);
            $totalrows = $result[0]->totalrows;

            $offset= ($page-1) * $rowsperpage;
            if($totalrows < $offset){
                $offset=0;
            }
            
            $stmt = $conn->prepare('SELECT * FROM transfers '.$where.' ORDER BY account_action_seq DESC LIMIT '.$rowsperpage.' OFFSET '.$offset);
            $stmt->execute();
            $result = $stmt->fetchALL(PDO::FETCH_OBJ);

            $json=["totalrows"=>$totalrows, "data"=>$result];
        }





// $stmt->execute();
// set the resulting array to associative
// $result = $stmt->fetchALL(PDO::FETCH_OBJ);



header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: *');
// header('Content-Type: application/json');
echo json_encode($json);
?>

