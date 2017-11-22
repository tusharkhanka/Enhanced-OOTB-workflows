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
	Alvex.OfficeSiteChooser= function(htmlId)
	{
		Alvex.OfficeSiteChooser.superclass.constructor.call(this, "Alvex.OfficeSiteChooser", htmlId);
		YAHOO.Bubbling.on("formContentReady", this.onFormContentReady, this);
		return this;
	};

	YAHOO.extend(Alvex.OfficeSiteChooser, Alfresco.component.Base,
	{
		options:
		{
			initialized: false,
			disabled: false,
			selectEl: null
		},

		onReady: function SiteChooser_onReady()
		{
			// Workaround for strange bug when onReady is not called
			if( this.options.initialized )
				return;

			this.fillSelect();
			this.options.initialized = true;
		},
		
		onFormContentReady: function SiteChooser_onFormContentReady()
		{
			// Workaround for strange bug when onReady is not called
			if( this.options.initialized )
				return;

			this.fillSelect();
			this.options.initialized = true;
		},

		fillSelect: function SiteChooser_fillSelect()
		{
			if( this.options.disabled )
			{
				var shortName = document.getElementById( this.id ).value;
				if( shortName == '' )
					return;
				var xmlHttp = new XMLHttpRequest();
				xmlHttp.open("GET", Alfresco.constants.PROXY_URI + "/api/sites/" 
					+ encodeURIComponent(shortName), false);
				if (Alfresco.util.CSRFPolicy && Alfresco.util.CSRFPolicy.isFilterEnabled())
					xmlHttp.setRequestHeader( Alfresco.util.CSRFPolicy.getHeader(), Alfresco.util.CSRFPolicy.getToken() );
				xmlHttp.send(null);

				if (xmlHttp.status != 200)
					return;
				
				var details = eval('(' + xmlHttp.responseText + ')');
				document.getElementById( this.id + '-cntrl-display' ).innerHTML = details.title;
				YAHOO.util.Dom.addClass(this.id + '-cntrl-select', 'hidden');
				return;
			}
			
			var me = this;
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.open("GET", Alfresco.constants.PROXY_URI + "/api/people/" 
				+ encodeURIComponent(Alfresco.constants.USERNAME) + "/sites?roles=user", false);
			if (Alfresco.util.CSRFPolicy && Alfresco.util.CSRFPolicy.isFilterEnabled())
				xmlHttp.setRequestHeader( Alfresco.util.CSRFPolicy.getHeader(), Alfresco.util.CSRFPolicy.getToken() );
			xmlHttp.send(null);

			if (xmlHttp.status != 200)
				return;

			var allSites = eval('(' + xmlHttp.responseText + ')');
			this.options.selectEl = document.getElementById( this.id + '-cntrl-select' );
			YAHOO.util.Event.on( this.id + '-cntrl-select', 'change', this.onValueChange, null, this);
			
			var availableSites = [];
			for(var s in allSites)
				if( ( allSites[s].sitePreset == "documents-register-dashboard" )
								&& ( (allSites[s].siteRole == "SiteCollaborator") 
									|| (allSites[s].siteRole == "SiteManager") )
					)
							availableSites.push(allSites[s]);

			if( availableSites.length > 1 ) {
				for(var s in availableSites) {
						this.options.selectEl.options.add( new Option(
									availableSites[s].title, availableSites[s].shortName) );
				}
			} else if (availableSites.length == 1) {
				this.options.selectEl.options.add( new Option(
							availableSites[0].title, availableSites[0].shortName) );
				YAHOO.util.Dom.addClass(this.id + '-cntrl-select', 'hidden');
				this.setNewValue(availableSites[0].shortName);
			} else {
				YAHOO.util.Dom.addClass(this.id + '-cntrl-select', 'hidden');
			}
		},
		
		onValueChange: function(ev)
		{
			var newVal = this.options.selectEl.value;
			this.setNewValue(newVal);
		},
		
		setNewValue: function(newVal)
		{
			document.getElementById( this.id ).value = newVal;
			if(newVal != "") {
				var newLabel = "";
				for( var i = 0; i < this.options.selectEl.length; i++)
					if( this.options.selectEl[i].value == newVal)
						newLabel = this.options.selectEl[i].label;
				document.getElementById( this.id + '-cntrl-display' ).innerHTML = newLabel;
			} else {
				document.getElementById( this.id + '-cntrl-display' ).innerHTML = this.msg("alvex.officeSite.notSet");
			}
			YAHOO.Bubbling.fire('officeSiteSelected', newVal);
			YAHOO.Bubbling.fire("mandatoryControlValueUpdated", this);
		}
	});
})();
