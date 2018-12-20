const request = require('request');
var CONF = require('./config.json');

function mailchimpAddToList(email, language){
    var subscriber = JSON.stringify({
            "email_address": email,
            "status": "subscribed",
            "merge_fields": {
                "LANGUAGE": language
            }
            
    });
    return new Promise(function(resolve, reject) {
        request({
            method: 'POST',
            url: CONF.mailchimp.url,
            body: subscriber,
            headers:{
                Authorization: 'apikey '+ CONF.mailchimp.apiKey,
                'Content-Type': 'application/json'
            }
        },
        function(error, response, body){
            if(error) {
                console.log(error)
                reject('error_occured');
            } 
            else{
                var bodyObj = JSON.parse(body);
 
                let msg = '';

                switch(bodyObj.status) {
                    case 400:
                        msg = 'already_subscribed';
                        break;
                    case 'subscribed':
                        msg = 'subscribed_successfully';
                        break;
                    default:
                        msg = 'error_occured'
                } 
                resolve(msg);

            }
        });
    });
}

module.exports.mailchimpAddToList = mailchimpAddToList; 