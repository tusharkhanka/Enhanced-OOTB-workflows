<html>
    <head>
		<style type="text/css"><!--
      body
      {
         font-family: Arial, sans-serif;
         font-size: 14px;
         color: #4c4c4c;
      }
      
      a, a:visited
      {
         color: #0072cf;
      }
      --></style>
	</head>
    <body>
		Hello,<br /><br />
		You have been assigned a ${review} task.<br />
		Take the appropriate action by clicking link below.<br /><br />
        <p><a href="${shareUrl}/page/task-edit?taskId=${taskID}">${shareUrl}/page/task-edit?taskId=${taskID}</a><br /><br /><br /><br />
		

			<#if attachedDocsInfoList??>
				Below are the documents attached in the workflow.
                                           <table cellpadding="0" callspacing="0" border="0" bgcolor="#eeeeee" style="padding:10px; border: 1px solid #aaaaaa;">
                                                   <#list attachedDocsInfoList as doc>
                                                      <tr>
                                                         <td>
                                                            <table cellpadding="0" cellspacing="0" border="0">
                                                               <tr>
                                                                  <td valign="top">
                                                                     <img src="${shareUrl}/res/components/images/generic-file.png" alt="" width="64" height="64" border="0" style="padding-right: 10px;" />
                                                                  </td>
                                                                  <td>
                                                                     <table cellpadding="2" cellspacing="0" border="0">
                                                                        <tr>
                                                                           <td><b>${doc.docName}</b></td>
                                                                        </tr>
                                                                        <tr>
                                                                           <td>Click on this link to view the document:</td>
                                                                        </tr>
                                                                        <tr>
                                                                           <td>
                                                                              <a href="${shareUrl}/${doc.docLink}">
                                                                              ${shareUrl}/${doc.docLink}</a>
                                                                           </td>
                                                                        </tr>
                                                                     </table>
                                                                  </td>
                                                               </tr>
                                                            </table>
                                                         </td>
                                                      </tr>
                                                      <#if doc_has_next>
                                                         <tr><td><div style="border-top: 1px solid #aaaaaa; margin:12px;"></div></td></tr>
                                                      </#if>
                                                   </#list>
                                                </table>
                                             </#if>
		<br /><br />Yours Sincerely<br />
		Alfresco
    </body>
</html>
