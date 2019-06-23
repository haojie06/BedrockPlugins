#!/bin/bash
mkdir -p build
read -p "Mods Name? " name
read -p "Mods Description? " desc
uuid1=$(uuidgen)
uuid2=$(uuidgen)
result=$(
  export name desc uuid1 uuid2
  envsubst <manifest.json.tmp
)
echo "$result"
select yn in "OK" "Cancel"; do
  case $yn in
  "OK")
    echo "$result" >build/manifest.json
    echo "Created"
    break
    ;;
  *)
    echo "Canceled"
    exit 1
    ;;
  esac
done
