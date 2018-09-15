<h2>Script for constructing token balances based on transfer actions</h2>

This script only works on nodes that have the history plugin enabled with the correct filter. It will populate the database with all transfer actions and construct the balances (live) with the help of a mysql trigger.

1. **Install modules**

    ```
    npm install
    ```

2. **Create Mysql tables with triggers**

    ```
    see sql.txt
    ```

3. **Edit the action_deamon.js file with your mysql and eos node.**

    ![image](https://user-images.githubusercontent.com/5130772/43356181-392b693a-926c-11e8-9304-c9eb0542df43.png)

4. **Run script**

    ```
    node action_deamon_promise.js
    ```
    ![image](https://user-images.githubusercontent.com/5130772/43351339-c47a52d2-9210-11e8-81bb-3159cc0d1515.png)

5. **Use pm2 (process manager) to deamonize the script**

    ```
    npm install pm2 -g
    pm2 start action_deamon.js
    ```
    verify that the deamon is running
    ```
    pm2 list
    ```
    ![image](https://user-images.githubusercontent.com/5130772/43351300-53586832-9210-11e8-8905-835646e6e94a.png)
