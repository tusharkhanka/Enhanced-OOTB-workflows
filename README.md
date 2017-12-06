Enhanced Out of the box workflows for alfresco 5.2


This project has 2 Enhancement for the workflows.



1. It sends a  reminder email to the assignee after every one minute that can bhe changes by the cron in the .bpmn files that resides in 
src/main/resources/alfresco/module/Enhanced-workflow-repo/workflow. For this the outboud email configuration should be corret in alfresco-global.properties.
### Outbound Mail Configuration ###
mail.from.default=no-reply@alfresco.com
mail.from.enabled=false
mail.host=
mail.port=
mail.protocol=smtp
mail.username=
mail.password=
mail.encoding=UTF-8
mail.smtps.starttls.enable=true
mail.smtps.auth=true

An default email temaplate should also be present in alfresco share Data dictionary/Email temaplate/
One has been included in temaplate folder of this project

2. With the help of alvex core util module and uploader module, an Uploader could be intigrated in the out of the box workflows. A file can be uploaded in the workflow from local machine at the initiation of the workflow. This document can be previewed and downloaded by the assignee in alfresco share.
