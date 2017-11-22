/**
 * Copyright © 2012 ITD Systems
 *
 * This file is part of Alvex
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// Ensure root object exists
if (typeof Alvex == "undefined" || !Alvex)
{
	var Alvex = {};
}

(function()
{
	Alvex.RegisterDocuments = function(htmlId)
	{
		Alvex.RegisterDocuments.superclass.constructor.call(this, "Alvex.RegisterDocuments", htmlId);
		YAHOO.Bubbling.on("autoNumbererInfo", this.onAutoNumbererInfo, this);
		
		YAHOO.Bubbling.on('officeSiteSelected', this.fillComboBox, this);
		return this;
	};

	YAHOO.extend(Alvex.RegisterDocuments, Alfresco.component.Base,
	{
		options:
		{
			officeSite: '',
			dataLists: [],
			documents: [],
			autoNumbererField: '',
			typesFilter: '',
			disabled: false,
			dataSource: null,
			dataTable: null,
			menuEl: null
		},

		onReady: function()
		{
			this.createDataTable();
			this.readOldValues();
			this.updateUI();
			if(this.options.disabled)
			{
				Dom.removeClass( this.id + '-cntrl', "hidden");
				Dom.addClass( this.id + '-cntrl-warning', "hidden" );
			}
		},
		
		onAutoNumbererInfo: function(ev, param)
		{
			this.options.autoNumbererField = param[1].htmlId;
		},
		
		readOldValues: function()
		{
			if( Dom.get(this.id).value == '')
				return;
			var oldItems = Dom.get(this.id).value.split(',');
			
			Alfresco.util.Ajax.jsonPost(
			{
				url: Alfresco.constants.PROXY_URI + "api/alvex/documents-registers/items/find",
				dataObj: { "itemRefs": oldItems.join(',') },
				successCallback:
				{
					fn: function(response)
					{
						for( var i in response.json)
							this.options.documents.push( { 
								"nodeRef": response.json[i].ref, 
								"parentRef": "",
								"itemType": "",
								"title": response.json[i].registerTitle,
								"ID": response.json[i].ID
							} );
						this.updateUI();
					},
					scope: this
				},
				failureCallback:
				{
					fn: function(response)
					{
						Alfresco.util.PopupManager.displayMessage(
						{
							text: response.serverResponse.responseText
						});
					},
					scope: this
				}
			});
		},

		fillComboBox: function(ev, param)
		{
			this.options.officeSite = param[1];
			if(this.options.officeSite == '') {
				Dom.addClass( this.id + '-cntrl', "hidden");
				Dom.removeClass( this.id + '-cntrl-warning', "hidden" );
				return;
			}
			
			Dom.removeClass( this.id + '-cntrl', "hidden");
			Dom.addClass( this.id + '-cntrl-warning', "hidden" );
			
			var listDefs = YAHOO.lang.substitute(
				"{proxy}slingshot/datalists/lists/site/{siteName}/dataLists",
				{
					proxy: Alfresco.constants.PROXY_URI,
					siteName: encodeURIComponent( this.options.officeSite )
				}
				);

			Alvex.util.processAjaxQueue({
				queue: [
					{
						url: listDefs,
						responseContentType: Alfresco.util.Ajax.JSON,
						successCallback: {
							fn: function(response)
							{
								this.options.dataLists = response.json.datalists;
								var menuItems = [];
								for (var key in this.options.dataLists)  {
									var list = this.options.dataLists[key];
										menuItems.push({
											text: list.title,
											value: list.itemType
										});
								}
								if( this.options.menuEl != null )
								{
									delete this.options.menuEl;
									Dom.get(this.id + '-cntrl-selector-container').innerHTML 
										= '<input id="' 
											+ this.id + '-cntrl-selector" type="button" value="' 
											+ this.msg("alvex.register_documents.select_register") 
											+ '" name="-" />';
								}
								this.options.menuEl = new YAHOO.widget.Button(
									this.id + "-cntrl-selector",
									{
										type: "menu",
										menu: menuItems
									}
									);
								this.options.menuEl.getMenu().subscribe("click", this.registerDocument, null, this);
							},
							scope: this
						}
					}
				]
			});
		},

		createDataTable: function()
		{
			var me = this;
			
			// Hook action events
			var fnActionHandler = function fnActionHandler(layer, args)
			{
				var owner = YAHOO.Bubbling.getOwnerByTagName(args[1].anchor, "div");
				if (owner !== null)
				{
					if (typeof me[owner.className] == "function")
					{
						args[1].stop = true;
						var asset = me.options.dataTable.getRecord(args[1].target.offsetParent).getData();
						me[owner.className].call(me, asset, owner);
					}
				}
				return true;
			};
			YAHOO.Bubbling.addDefaultAction(this.id + "-action-link", fnActionHandler, true);

			// Columns defs
			var columnDefs =
			[
				{
					key: 'title',
					label: this.msg("alvex.documents.register"),
					sortable:false,
					resizeable:true,
					width:125,
					formatter: this.formatRegisterField
				},

				{
					key: 'ID',
					label: this.msg("alvex.documents.id"),
					sortable:false,
					resizeable:true,
					width:125,
					formatter: this.formatIdField
				},
				{
					key: '',
					label: this.msg('alvex.documents.actions'),
					sortable:false,
					resizeable:true,
					width:100,
					formatter: this.formatActionsField
				}
			];

			this.options.dataSource = new YAHOO.util.DataSource( this.options.documents );
			this.options.dataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
			this.options.dataSource.responseSchema = { 
				fields: [ 'nodeRef', 'title', 'itemType', 'parentRef', 'ID' ] 
			};
			this.options.dataSource.maxCacheEntries = 0;

			// Create the table
			this.options.dataTable = new YAHOO.widget.DataTable(
				this.id + "-cntrl-dataTableContainer", columnDefs, this.options.dataSource,
				{
					selectionMode:"single",
					renderLoopSize: 32,
					MSG_EMPTY: this.msg('alvex.documents.no_documents')
				});
			this.options.dataTable.registerDocuments = this;
		    this.options.dataTable.showTableMessage(
				this.msg('alvex.documents.loading'),
				YAHOO.widget.DataTable.CLASS_LOADING
			);
				
			// Enable row highlighting
			this.options.dataTable.subscribe("rowMouseoverEvent", this.onEventHighlightRow, this, true);
			this.options.dataTable.subscribe("rowMouseoutEvent", this.onEventUnhighlightRow, this, true);
		},

		updateUI: function()
		{
			YAHOO.Bubbling.fire("mandatoryControlValueUpdated", this);
			this.options.dataSource.sendRequest(
				null,
				{
					success: this.options.dataTable.onDataReturnInitializeTable, 
					scope: this.options.dataTable
				}
			);
		},

		formatRegisterField: function (elLiner, oRecord, oColumn, oData)
		{
			elLiner.innerHTML = oData;
		},

		formatIdField: function (elLiner, oRecord, oColumn, oData)
		{
			elLiner.innerHTML = oData;
		},

		formatActionsField: function (elLiner, oRecord, oColumn, oData)
		{
			if( this.registerDocuments.options.mode == "view" )
			{
				elLiner.innerHTML = '';
				return;
			}			
						
			var id = this.registerDocuments.id;
			var html = '<div id="' + id + '-actions-' + oRecord.getId() + '" class="hidden action">';
			
			var msg = this.registerDocuments.msg('alvex.document.view');
			var clb = 'viewDocument';			
			html += '<div class="' + clb + '"><a rel="view" href="" ' 
					+ 'class="document-registers-action-link ' + id + '-action-link"'
					+ 'title="' + msg +'"><span>' + msg + '</span></a></div>';
			
			html += '</div>';
			
			elLiner.innerHTML = html;
		},
		
		viewDocument: function(obj)
		{
			var scope = this;
			
			// Intercept before dialog show
			var doBeforeDialogShow = function(p_form, p_dialog)
			{
				Alfresco.util.populateHTML(
					[ p_dialog.id + "-dialogTitle", this.msg("alvex.document.view") ]
				);
			};
			
			var templateUrl = YAHOO.lang.substitute(Alfresco.constants.URL_SERVICECONTEXT 
					+ "components/form?itemKind={itemKind}&itemId={itemId}&mode={mode}&submitType={submitType}&showCancelButton=true",
			{
				itemKind: "node",
				itemId: obj.nodeRef,
				mode: "view",
				submitType: "json"
			});
			
			// Using Forms Service, so always create new instance (?) - we do not do it
			var viewDetails = new Alvex.SimpleDialog(this.id + "-viewDetails");
			viewDetails.setOptions(
			{
				width: "50em",
				templateUrl: templateUrl,
				actionUrl: null,
				destroyOnHide: false,
				formsServiceAvailable: false,
				doBeforeDialogShow:
				{
					fn: doBeforeDialogShow,
					scope: scope
				}
			}).show();
		},
		
		onEventHighlightRow: function DataGrid_onEventHighlightRow(oArgs)
		{
			var elActions = Dom.get(this.id + "-actions-" + oArgs.target.id);
			Dom.removeClass(elActions, "hidden");
		},

		onEventUnhighlightRow: function DataGrid_onEventUnhighlightRow(oArgs)
		{
			var elActions = Dom.get(this.id + "-actions-" + (oArgs.target.id));
			Dom.addClass(elActions, "hidden");
		},

		registerDocument: function( p_sType, p_aArgs )
		{
			var oEvent = p_aArgs[0];	//  DOM event from the menu
			var oMenuItem = p_aArgs[1];	//  Target of the event (selected item)
			
			var type = oMenuItem.value;
			
			// Custom template URL for the dialog
			var templateUrl = YAHOO.lang.substitute(
				Alfresco.constants.URL_SERVICECONTEXT 
				+ "components/form?itemKind={itemKind}&itemId={itemId}&mode={mode}"
				+ "&destination={destination}&submitType={submitType}&showCancelButton=true",
				{
					itemKind: "type",
					itemId: type,
					mode: "create",
					destination: this.options.dataLists[oMenuItem.index].nodeRef,
					submitType: "json"
				});
			this.options.currentList = this.options.dataLists[oMenuItem.index];

			// Create new dialog

			// It looks like 'destroyOnHide: true' works globally for all dialogs on the page - do not use it
			// We still delete dialog manually because we are to clear the form and everything around it
			if( this.widgets.dialog )
				delete this.widgets.dialog;

			this.widgets.dialog = new Alfresco.module.SimpleDialog(this.id + "-alvex-docreg-popup-dialog");

			this.widgets.dialog.setOptions(
			{
				width: "50em",			// TODO make it configurable or relative
				templateUrl: templateUrl,	// Our custom template URL
				destroyOnHide: false,
				
				doBeforeAjaxRequest:
				{
					fn: function(config, obj)
					{
						// If there is no auto numberer - just submit
						if(this.options.autoNumbererField == '')
							return true;
						var prop = this.options.autoNumbererField.replace(/.*_prop_/,'').replace(/-cntrl/,'');
						var number = YAHOO.lang.trim(Dom.get(this.options.autoNumbererField).value);
						var json = JSON.stringify( {
							register: this.options.dataLists[oMenuItem.index].nodeRef,
							number: number,
							prop: prop
						} );
						this.options.dataLists[oMenuItem.index].lastID = number;
						
						// Try to commit document number
						// Do not submit if duplicate number found
						var xmlHttp_req = new XMLHttpRequest();
						xmlHttp_req.open("POST", Alfresco.constants.PROXY_URI
								+ "api/alvex/documents-registers/number/commit",
								false);
						if (Alfresco.util.CSRFPolicy && Alfresco.util.CSRFPolicy.isFilterEnabled())
							xmlHttp_req.setRequestHeader( Alfresco.util.CSRFPolicy.getHeader(), Alfresco.util.CSRFPolicy.getToken() );
						xmlHttp_req.setRequestHeader("Content-Type", "application/json");
						
						xmlHttp_req.send( json );
						
						if (xmlHttp_req.status != 200)
							return false;
						
						var resp = eval('(' + xmlHttp_req.responseText + ')');
						if(resp.success)
						{
							config.dataObj["prop_" + prop] = resp.id;
							delete config.dataObj["description"];
							delete config.dataObj["majorVersion"];
							delete config.dataObj["alf_destination"];
							config.url = config.url.replace(/type\/.*\/formprocessor/,"");
							config.url += "node/" + resp.ref.replace(":/","") + "/formprocessor";
							return true;
						}

						Alfresco.util.PopupManager.displayMessage(
						{
							text: this.msg("message.duplicate-number.failure") + this.msg("message.duplicate-number.nextIdHelp"),
							noEscape: true,
							displayTime: 7
						});
						
						Dom.get(this.options.autoNumbererField).value = resp.id;
						Dom.get(this.options.autoNumbererField + "-edit").value = resp.id;
						Dom.get(this.options.autoNumbererField + "-display").value = resp.id;

						YAHOO.lang.later( 2500, this.widgets.dialog, this.widgets.dialog.show );

						if( this.widgets.dialog.form._toggleSubmitElements )
							this.widgets.dialog.form._toggleSubmitElements(true);

						return false;
					},
					scope: this
				},
				
				// Before dialog show we just set its title
				doBeforeDialogShow:
				{
					fn: function RelWf_customizeDialogProperties(p_form, p_dialog)
					{
						Dom.addClass(p_dialog.id + "-form-cancel", "hidden");
						Alfresco.util.populateHTML([
							p_dialog.id + "-dialogTitle", 
							Alfresco.util.message(this.msg("alvex.document.new_document_title"))
							]);
						YAHOO.Bubbling.fire('uploaderSetTargetSite', this.options.officeSite);
					},
					scope: this
				},

				// It is called when dialog is closed with success.
				// It means child workflow was started successfully and we got the response.
				onSuccess:
				{
					fn: function RelWf_dialog_on_success(response, p_obj)
					{
						var newItem = response.json.persistedObject;
						this.options.documents.push( { 
							"nodeRef": newItem, 
							"parentRef": this.options.dataLists[oMenuItem.index].nodeRef,
							"itemType": this.options.dataLists[oMenuItem.index].itemType,
							"title": this.options.dataLists[oMenuItem.index].title,
							"ID": this.options.dataLists[oMenuItem.index].lastID
						} );
						var addedEl = Dom.get( this.id + "_added");
						if( addedEl.value == '')
							addedEl.value = newItem;
						else
							addedEl.value += ',' + newItem;
						var valueEl = Dom.get( this.id );
						if( valueEl.value == '')
							valueEl.value = newItem;
						else
							valueEl.value += ',' + newItem;
						this.updateUI();
					},
					scope: this
				},

				onFailure:
				{
					fn: function RelWf_dialog_on_failure(response)
					{
						// Do smth
					},
					scope: this
				}
			}).show();
		}
		
	});
})();
