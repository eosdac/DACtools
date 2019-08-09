README.md

Some code pulled from https://github.com/lukestokes/prospectorsdac/blob/master/includes/functions.php to use defuse to collect data and work with it as cached files. 

Steps to run this yourself:

1) Add a .api_credentials.json file in the same folder as index.php the following format:

```
{"api_key":"server_38abe.....","token":"eyJhbGci......","expires_at":1565463026}
```

2) Run a local php webserver via: `php -S localhost:8000`

3) Pass in old_block_num and new_block_num as url GET parameters to compare data across specific blocks such as `http://localhost:8000/?old_block_num=37640280&new_block_num=41640280`