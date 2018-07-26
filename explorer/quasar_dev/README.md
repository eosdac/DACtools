Token explorer

**1. Install Vue-Cli**
```
yarn global add vue-cli
or:
npm install -g vue-cli
```

**2. Install Quasar-Cli**

```
# Node.js >= 8.9.0 is required.
yarn global add quasar-cli
or:
npm install -g quasar-cli
```
**3. Clone Repo**

**4. Install modules**
```
# in project directory
yarn install
or:
npm install
```
**5. Run dev server with material theme**
```
quasar dev
```
[Quasar Docs](https://quasar-framework.org/guide/index.html)

**Deployment for production**

**1. Build project for production**
```
quasar build
```
**2. Copy content of dist/spa-mat folder to your webserver**
**3. Add .htaccess file to the root folder **

because this app is a single page application we need to tell the webserver to redirect urls pointing to a non existing file to the index.html file.
```
RewriteEngine On
RewriteBase /
RewriteRule ^index.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```
**4. Enable mod_rewrite module and AllowOverride ALL (Apache2) **
```
//enable mod_rewrite
sudo a2enmod rewrite
//restart apache2
sudo /etc/init.d/apache2 restart
OR
sudo systemctl restart apache2

//edit apache2.conf
<Directory /var/www/>
	Options Indexes FollowSymLinks
	AllowOverride ALL
	Require all granted
</Directory>
```
