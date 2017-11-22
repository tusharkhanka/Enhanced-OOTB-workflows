<#include "/org/alfresco/components/component.head.inc">
<#assign controlId = fieldHtmlId + "-cntrl">

<div class="form-field">

	<input type="hidden" id="${fieldHtmlId}" name="-" value="${field.value?html}" />

	<label for="${controlId}">${field.label?html}:
		<#if field.mandatory><span class="mandatory-indicator">${msg("form.required.fields.marker")}</span></#if>
	</label>

	<div id="${controlId}"></div>
</div>

<script type="text/javascript">
<#include "/review-summary.js.ftl">
</script>
