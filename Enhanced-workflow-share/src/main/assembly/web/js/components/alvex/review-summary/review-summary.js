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
	Alvex.ReviewSummary= function(htmlId)
	{
		Alvex.ReviewSummary.superclass.constructor.call(this, "Alvex.ReviewSummary", htmlId);
		YAHOO.Bubbling.on("formContentReady", this.onFormContentReady, this);
		return this;
	};

	YAHOO.extend(Alvex.ReviewSummary, Alfresco.component.Base,
	{
		options:
		{
			initialized: false,
			comments: []
		},

		onReady: function SiteChooser_onReady()
		{
			// Workaround for strange bug when onReady is not called
			if( this.options.initialized )
				return;

			this.fillTable();
			this.options.initialized = true;
		},

		onFormContentReady: function SiteChooser_onFormContentReady()
		{
			// Workaround for strange bug when onReady is not called
			if( this.options.initialized )
				return;

			this.fillTable();
			this.options.initialized = true;
		},

		fillTable: function _fillTable()
		{
			var textData = document.getElementById(this.id).value;
			var textComments = textData.match(/{.*?}/gm);
			for(c in textComments) {
				var fields = textComments[c].split('|');
				this.options.comments.push( {
					"who": fields[0].replace('{',''), 
					"what": fields[1].replace('ApproveWithComments',this.msg("alvex.parallel_review.result_table.approved_with_comments")).replace('Approve',this.msg("alvex.parallel_review.result_table.approved")).replace('Reject',this.msg("alvex.parallel_review.result_table.rejected")), 
					"comment": fields[2].replace('}','')
				} );
			}

			var columnDefs = [
				{key:"who", label: this.msg("alvex.parallel_review.result_table.user"), sortable:true, resizeable:true, width:100},
				{key:"what", label: this.msg("alvex.parallel_review.result_table.result"), sortable:true, resizeable:true, width:100},
				{key:"comment", label: this.msg("alvex.parallel_review.result_table.comment"), sortable:false, resizeable:true, width:300}
			];

			this.widgets.dataSource = new YAHOO.util.DataSource(this.options.comments,
			{
				responseType: YAHOO.util.DataSource.TYPE_JSARRAY,
				responseSchema:
				{
					fields: [ "who", "what", "comment" ]
				}
			});

			this.widgets.dataTable = new YAHOO.widget.DataTable(this.id + "-cntrl",
					columnDefs, this.widgets.dataSource, {
						selectionMode:"single",
						renderLoopSize: 32,
						MSG_EMPTY: 'No reviews'
					});
		}
	});
})();
