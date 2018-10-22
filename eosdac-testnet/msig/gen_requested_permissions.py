#!/usr/bin/env python

import subprocess
import json

permission_act = 'dacauthority'
api_url = 'http://127.0.0.1:8666'

res = subprocess.check_output(['cleos', '-u', api_url, 'get', 'account', '-j', permission_act])

data = json.loads(res)


permissions = data['permissions']

requested_permissions = []

for perm in permissions:

    if perm['perm_name'] == "high":

        acts = perm['required_auth']['accounts']
        for act in acts:
            requested_permissions.append(act['permission'])
        break

requested_permissions_json = json.dumps(requested_permissions)

requested_permissions_fp = open("requested_perms.json", "w")
requested_permissions_fp.write(requested_permissions_json)
requested_permissions_fp.close()

print("Wrote requested_perms.json")

