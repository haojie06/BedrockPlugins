#!/bin/bash
echo "warning! it will remove all the template from your directory, and can only be rollback by git!"
select yn in "OK" "Cancel"; do
  case $yn in
  "OK")
    rm -rf clean.sh init.sh *.tmp
    sed -i '/package-lock.json/d' .gitignore
    echo "Cleaned"
    break
    ;;
  *)
    echo "Canceled"
    exit 1
    ;;
  esac
done
