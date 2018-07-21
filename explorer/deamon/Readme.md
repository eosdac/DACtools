#Script for constructing token balances based on transfer actions

this script only works on nodes that have the history plugin enabled with the correct filter.

**1. Install modules**
```
npm install
```

**2. Create Mysql tables with triggers**

```
see sql.txt
```

**3. Run script**
```
node action_deamon_promise.js
```

**4. Use pm2 (process manager) to deamonize the script**
```
npm i pm2
pm2 start action_deamon_promise.js
```

