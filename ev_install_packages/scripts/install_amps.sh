#NOTE: This script must be run as sudo or su
#NOTE: This script uses the apt-get package manager, which is standard on ubuntu
#NOTE: This script assumes Alfresco Root is passed as a parameter



alfresco_dir=$1
echo "Installing to $alfresco_dir"


#step 1 - stop alfresco
$alfresco_dir/alfresco.sh stop

#step 4 - reinstall uploader plus amps
rm $alfresco_dir/amps/*
rm $alfresco_dir/amps_share/*

#step 2 copy and apply AMP file with Alfresco code changes
#to be done manually
cp ../amps_share/share.amp $alfresco_dir/amps_share/
cp ../amps/repo.amp $alfresco_dir/amps/

#step 3 - copying alfresco-global.properties file
#cp alfresco-global.properties $alfresco_dir/tomcat/shared/classes

$alfresco_dir/bin/apply_amps.sh -force -verbose

rm -rf $alfresco_dir/tomcat/webapps/share

#step 4 - start alfresco
echo "Trying to start alfresco"
$alfresco_dir/alfresco.sh start


