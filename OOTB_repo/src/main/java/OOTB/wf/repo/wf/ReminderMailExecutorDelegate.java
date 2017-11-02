package OOTB.wf.repo.wf;

import org.activiti.engine.delegate.DelegateExecution;
import org.alfresco.repo.jscript.ScriptNode;
import org.alfresco.repo.workflow.activiti.BaseJavaDelegate;
import org.alfresco.service.cmr.repository.NodeRef;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * 
 * @author Hiten Rastogi
 *
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
		String templatePATH = "PATH:\"/app:company_home/app:dictionary/app:email_templates/cm:wf-reminder-email-1.html.ftl\"";

		/**
		 * @groupName = group to which the email needs to be sent
		 */
		/*		String groupName = (String) execution.getVariable("evwf_groupName");*/
		String recipient = (String) execution.getVariable("evwf_recipient");

		/**
		 * @workflowDescription = description of the workflow
		 */
		String workflowDescription = (String) execution.getVariable("bpm_workflowDescription");
		
		/**
		 * taskId = taskId of the current task
		 */
		String taskId = "activiti$"	+ (String) execution.getVariable("evwf_taskID");
		
		/**
		 * @initiator = initiator of the workflow
		 */
//		String initiator = (String) execution.getVariable("evwf_initiator");
		
		/**
		 * @subject = subject of the email
		 */
		String subject = "REMINDER: ";

		// Get workflow package noderef
		ScriptNode scriptnode = (ScriptNode) execution
				.getVariable("bpm_package");
		NodeRef packageNodeRef = scriptnode.getNodeRef();
		
		CustomWorkflowUtil customWorkflowUtil = new CustomWorkflowUtil();

		// call to  prepareReminderMail method of CustomWorkflowUtil
		customWorkflowUtil.prepareReminderMail(workflowDescription,
				templatePATH, recipient, taskId,  subject,
				packageNodeRef);

	}

}
