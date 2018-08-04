<h2>Select fastest responding bp node</h2>
<p>This script will select the fastest responding eos node from the 21 active blockproducers. It can also give you a list of all 21 BP-nodes filtered by https (option).</p>
<p>
It will first get a the node urls from the 21 block producers through our bp.json api https://eosdac.io/topnodes.json. It will then start a request race, the fastest responding node that supports https will get resolved immediatly. 
</p>

Clone repo and install with npm in root folder
```
cd ./nodeselector
npm install
```
Run test script
```
node test.js
```
Example output of test.js

![image](https://user-images.githubusercontent.com/5130772/43662889-b85ecf8a-9767-11e8-95bb-47d3a42b3a2a.png)
