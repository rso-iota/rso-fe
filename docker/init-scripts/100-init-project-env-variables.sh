#!/usr/bin/env sh
set -e

viteEnvScriptFile=$(ls -t /usr/share/nginx/html/assets/projectEnvVariables*.js | head -n1)

echo "Replacing environment variables in $viteEnvScriptFile"

vars=$(grep -o '\${[a-zA-Z_][a-zA-Z0-9_]*}' "$viteEnvScriptFile" | sort | uniq)

echo "Found the following env. variable templates:"
for var in $vars; do
    echo -n "$var " 
done

echo

for var in $vars; do
    varName=$(echo "$var" | sed 's/[${}]//g')
    
    if [ -z "$(printenv "$varName")" ]; then
        echo "!!!!!Warning: Environment variable $varName is not set!"
    else
        echo "Variable $varName is set to: $(printenv "$varName")"
    fi
done

envsubst < "$viteEnvScriptFile" > ./tmp_viteEnvScriptFile.js
cp ./tmp_viteEnvScriptFile.js "$viteEnvScriptFile"
rm ./tmp_viteEnvScriptFile.js