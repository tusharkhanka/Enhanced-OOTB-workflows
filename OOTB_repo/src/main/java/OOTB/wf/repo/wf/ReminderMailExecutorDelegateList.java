package OOTB.wf.repo.wf;

import org.activiti.engine.delegate.DelegateExecution;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.jscript.ScriptNode;
import org.alfresco.repo.workflow.activiti.BaseJavaDelegate;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;


/**
 * 
 * @author Hiten Rastogi
 *
 */
public class ReminderMailExecutorDelegateList extends BaseJavaDelegate {

	private static Log logger = LogFactory.getLog(ReminderMailExecutorDelegateList.class);

	@Override
	public void execute(DelegateExecution execution) throws Exception {

		logger.debug("In ReminderMailExecutorDelegateList execute method");

		/**
		 * @templatePATH = reminder email template location in the Repository
		 */
		String templatePATH = "PATH:\"/app:company_home/app:dictionary/app:email_templates/cm:wf-reminder-email-1.html.ftl\"";

		/**
		 * @groupName = group to which the email needs to be sent
		 */
		
		/*String groupName = (String) execution.getVariable("wf_Members");*/
		
		List<String> EmailList = (List<String>) execution.getVariable("wf_groupMembersEmail");
		List<String> groupName = EmailList;
		
		/*List groupName = new ArrayList();
		groupName.add(execution.getVariable("wf_groupMembersEmail"));*/
		logger.debug("In ReminderMailExecutorDelegateList execute method email id are " + groupName);
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
		String initiator = (String) execution.getVariable("evwf_initiator");
		
		/**
		 * @subject = subject of the email
		 */
		String subject = "REMINDER: ";

		// Get workflow package noderef
		ScriptNode scriptnode = (ScriptNode) execution.getVariable("bpm_package");
		ScriptNode scriptnode1 = (ScriptNode) execution.getVariable("bpm_groupAssignee");
		NodeRef packageNodeRef = scriptnode.getNodeRef();
		NodeRef packageNodeRef1 = scriptnode1.getNodeRef();
/*		logger.debug(packageNodeRef1);*/
		
		CustomWorkflowUtilList customWorkflowUtilList = new CustomWorkflowUtilList();

		// call to  prepareReminderMail method of CustomWorkflowUtil
		customWorkflowUtilList.prepareReminderMail1List(workflowDescription,
				templatePATH, groupName, taskId, initiator, subject, packageNodeRef);
		
		
		/*NodeService nodeService  = new NodeService();
		nodeService.getProperty(packageNodeRef1, ContentModel.PROP_AUTHORITY_NAME);*/
		

	}

}
