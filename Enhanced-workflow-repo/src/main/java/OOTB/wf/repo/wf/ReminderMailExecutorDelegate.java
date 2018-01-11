package OOTB.wf.repo.wf;

import java.util.List;

import org.activiti.engine.delegate.DelegateExecution;
import org.alfresco.repo.jscript.ScriptNode;
import org.alfresco.repo.workflow.activiti.BaseJavaDelegate;
import org.alfresco.service.cmr.repository.NodeRef;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * 
 * @author Hiten Rastogi
 * @author Tushar Khanka
 */
public class ReminderMailExecutorDelegate extends BaseJavaDelegate {

	private static Log logger = LogFactory
			.getLog(ReminderMailExecutorDelegate.class);

	@Override
	public void execute(DelegateExecution execution) throws Exception {

		logger.debug("In ReminderMailExecutorDelegate execute method");

		/**
		 * @templatePATH = reminder email template location in the Repository
		 */
		String templatePATH = "PATH:\"/app:company_home/app:dictionary/app:email_templates/cm:EisenVault_Email_Templates/cm:wf-reminder-email-1.html.ftl\"";

		/**
		 * @recipient = reviewer to whom the email needs to be sent
		 */
		/*		String groupName = (String) execution.getVariable("evwf_groupName");*/
		String recipient = (String) execution.getVariable("evwf_recipient");
		logger.debug("single reviewer is : " + recipient );
		
		/**
		 * @groupName = group to which the email needs to be sent
		 */
		List<String> EmailList = (List<String>) execution.getVariable("wf_groupMembersEmail");
		List<String> groupName = EmailList;
		logger.debug("group reviewers email addresses are: " + groupName );
		
		/**
		 * @workflowDescription = description of the workflow
		 */
		String workflowDescription = (String) execution.getVariable("bpm_workflowDescription");
		
		/**
		 * taskId = taskId of the current task
		 */
		String taskId = "activiti$"	+ (String) execution.getVariable("evwf_taskID");
		
		/**
		 * @subject = subject of the email
		 */
		String subject = "REMINDER: ";
		// Get workflow package noderef
		ScriptNode scriptnode = (ScriptNode) execution.getVariable("bpm_package");
		ScriptNode scriptnode1 = (ScriptNode) execution.getVariable("bpm_groupAssignee");
		NodeRef packageNodeRef = scriptnode.getNodeRef();
		//NodeRef packageNodeRef1 = scriptnode1.getNodeRef();
		logger.debug("it might work ");
		CustomWorkflowUtil customWorkflowUtil = new CustomWorkflowUtil();
		if (recipient == null){
			logger.debug(" Inside if groupName is not null " + groupName );
			
			// call to  prepareReminderMail method of CustomWorkflowUtil
			customWorkflowUtil.prepareReminderMailList(workflowDescription,
					templatePATH, groupName, taskId, subject, packageNodeRef);
			}
		else {
			logger.debug(" Inside else recipent is not null " + recipient );
			//CustomWorkflowUtil customWorkflowUtil = new CustomWorkflowUtil();
			customWorkflowUtil.prepareReminderMail(workflowDescription,
					templatePATH, recipient, taskId,  subject,
					packageNodeRef);
			}
		}

	}
