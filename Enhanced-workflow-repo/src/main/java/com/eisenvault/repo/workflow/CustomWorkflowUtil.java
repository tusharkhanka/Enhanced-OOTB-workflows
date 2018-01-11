package com.eisenvault.repo.workflow;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.activiti.engine.impl.cfg.ProcessEngineConfigurationImpl;
import org.activiti.engine.impl.context.Context;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.action.executer.MailActionExecuter;
import org.alfresco.repo.workflow.activiti.ActivitiConstants;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.action.Action;
import org.alfresco.service.cmr.action.ActionService;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * 
 * @author Hiten Rastogi
 *
 */
public class CustomWorkflowUtil {

	// Get services
	private NodeService nodeService = getServiceRegistry().getNodeService();
	private SiteService siteService = getServiceRegistry().getSiteService();
	private PersonService personService = getServiceRegistry().getPersonService();
	private ActionService actionService = getServiceRegistry().getActionService();
	private SearchService searchService = getServiceRegistry().getSearchService();

	private static Log logger = LogFactory.getLog(CustomWorkflowUtil.class);

	/**
	 * 
	 * @param templatePATH - contains path to the email template used for sending the mail
	 * @return noderef - noderef of the email template used in the mail
	 */
	public NodeRef getTemplateNodeRef(String templatePATH) {

		logger.debug("In CustomWorkflowUtil getTemplateNodeRef() method");
		ResultSet resultSet = searchService.query(new StoreRef(
				StoreRef.PROTOCOL_WORKSPACE, "SpacesStore"),
				SearchService.LANGUAGE_LUCENE, templatePATH);
		if (resultSet.length() == 0) {
			logger.error("Template " + templatePATH + " not found.");
			return null;
		}
		return resultSet.getNodeRef(0);
	}


	/**
	 * 
	 * @param templatePATH - contains path to the email template used for sending the mail
	 * @param groupName - list containing email of the recipients
	 * @param templateModel - parameters required by the email template
	 * @param subject - subject of the email
	 */
	public void sendMailList(String templatePATH, List<String> groupName,
			Map<String, Object> templateModel, String subject) {

		logger.debug("In CustomWorkflowUtil sendMailList() method");
		Action mailAction = actionService.createAction(MailActionExecuter.NAME);
		mailAction.setParameterValue(MailActionExecuter.PARAM_SUBJECT, subject + templateModel.get("workflowDescription"));
		mailAction.setParameterValue(MailActionExecuter.PARAM_TO_MANY, (Serializable) groupName);
		// Pass the email template noderef.
		mailAction.setParameterValue(MailActionExecuter.PARAM_TEMPLATE, getTemplateNodeRef(templatePATH));
		mailAction.setParameterValue(MailActionExecuter.PARAM_TEMPLATE_MODEL, (Serializable) templateModel);
		mailAction.setParameterValue(MailActionExecuter.PARAM_IGNORE_SEND_FAILURE, true);

		
		// execute the mail action
		actionService.executeAction(mailAction, null);
	}

	
	/**
	 * 
	 * @param templatePATH - contains path to the email template used for sending the mail
	 * @param recipientsList - list containing email of the recipients
	 * @param templateModel - parameters required by the email template
	 * @param subject - subject of the email
	 */
	public void sendMail(String templatePATH, String recipient,
			Map<String, Object> templateModel, String subject) {

		logger.debug("In CustomWorkflowUtil sendMail() method");

		Action mailAction = actionService.createAction(MailActionExecuter.NAME);
		mailAction.setParameterValue(MailActionExecuter.PARAM_SUBJECT, subject + templateModel.get("workflowDescription"));
		mailAction.setParameterValue(MailActionExecuter.PARAM_TO_MANY, (Serializable) recipient);
		// Pass the email template noderef.
		mailAction.setParameterValue(MailActionExecuter.PARAM_TEMPLATE, getTemplateNodeRef(templatePATH));
		mailAction.setParameterValue(MailActionExecuter.PARAM_TEMPLATE_MODEL, (Serializable) templateModel);
		mailAction.setParameterValue(MailActionExecuter.PARAM_IGNORE_SEND_FAILURE, true);
		// execute the mail action
		actionService.executeAction(mailAction, null);
	}

	/**
	 * 
	 * @param packageNodeRef - noderef of the current workflow in progress
	 * @return attachedDocsInfoList - list containing a map, which contains document name and document noderef
	 */
	public List<Map<String, String>> getAttachedDocsList(NodeRef packageNodeRef) {

		logger.debug("In CustomWorkflowUtil getAttachedDocsList() method");

		// Get the list of document noderefs attached to the workflow
		final List<ChildAssociationRef> lResources = nodeService
				.getChildAssocs(packageNodeRef);
		// List containing document name and link of the document
		final List<Map<String, String>> attachedDocsInfoList = new ArrayList<Map<String, String>>();

		for (ChildAssociationRef childAssociationRef : lResources) {
			NodeRef nodeRef = childAssociationRef.getChildRef();
			String docName = (String) nodeService.getProperty(nodeRef, ContentModel.PROP_NAME);
			logger.debug("Printing docName " + docName);
			SiteInfo siteInfo = siteService.getSite(nodeRef);
			String siteName = siteInfo.getShortName();
			logger.debug("Printing sitename " + siteName);
			String stringNodeRef = nodeRef.toString();
			String link = "page/site/" + siteName + "/document-details?nodeRef=" + stringNodeRef;
			Map<String, String> docPropMap = new HashMap<String, String>();
			docPropMap.put("docName", docName);
			docPropMap.put("docLink", link);
			attachedDocsInfoList.add(docPropMap);
		}

		logger.debug("Printing documents childAssociationRef " + lResources);
		logger.debug("Printing documents nodeRefIds " + attachedDocsInfoList);

		return attachedDocsInfoList;
	}

	
	/**
	 * 
	 * @param workflowDescription - description of the workflow
	 * @param templatePATH -  email template location in the Repository
	 * @param groupName - group to which the email needs to be sent
	 * @param taskId - taskId of the current task
	 * @param initiator - initiator of the workflow
	 * @param subject - subject of the workflow
	 * @param packageNodeRef - noderef of the current workflow in progress
	 */
	
	public void prepareReminderMailList(String workflowDescription,
			String templatePATH, List<String> groupName, String taskId,
			String subject, NodeRef packageNodeRef) {

		logger.debug("In CustomWorkflowUtil prepareReminderMailList() method");

		Map<String, Object> templateModel = new HashMap<String, Object>();

		templateModel.put("review", "review");
		logger.debug("Printing emailId group name wali " + groupName );
		templateModel.put("taskID", taskId);
		logger.debug("Printing taskId " + taskId );
		templateModel.put("attachedDocsInfoList", getAttachedDocsList(packageNodeRef));
		logger.debug("Printing packageNodeRef " + packageNodeRef );
		templateModel.put("workflowDescription", workflowDescription);
		logger.debug("Printing workflowDescription " + workflowDescription );

		sendMailList(templatePATH, groupName, templateModel, subject);

	}
	
	
	/**
	 * 
	 * @param workflowDescription - description of the workflow
	 * @param templatePATH -  email template location in the Repository
	 * @param recipient - reviewer to whom the email needs to be sent
	 * @param taskId - taskId of the current task
	 * @param subject - subject of the workflow
	 * @param packageNodeRef - noderef of the current workflow in progress
	 */
	public void prepareReminderMail(String workflowDescription,
			String templatePATH, String recipient, String taskId,
			String subject, NodeRef packageNodeRef) {

		logger.debug("In CustomWorkflowUtil prepareReminderMail() method");

		Map<String, Object> templateModel = new HashMap<String, Object>();
		templateModel.put("review", "review");
		templateModel.put("taskID", taskId);
		templateModel.put("attachedDocsInfoList", getAttachedDocsList(packageNodeRef));
		templateModel.put("workflowDescription", workflowDescription);

		sendMail(templatePATH, recipient, templateModel, subject);

	}

	/* taken from ActivitiScriptBase.java */
	protected ServiceRegistry getServiceRegistry() {
		ProcessEngineConfigurationImpl config = Context
				.getProcessEngineConfiguration();
		if (config != null) {
			// Fetch the registry that is injected in the activiti
			// spring-configuration
			ServiceRegistry registry = (ServiceRegistry) config.getBeans().get(
					ActivitiConstants.SERVICE_REGISTRY_BEAN_KEY);
			if (registry == null) {
				throw new RuntimeException(
						"Service-registry not present in ProcessEngineConfiguration beans, expected ServiceRegistry with key"
								+ ActivitiConstants.SERVICE_REGISTRY_BEAN_KEY);
			}
			return registry;
		}
		throw new IllegalStateException(
				"No ProcessEngineCOnfiguration found in active context");
	}
}
