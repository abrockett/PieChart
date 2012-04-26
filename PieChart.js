(function() {
    var Ext = window.Ext4 || window.Ext;
    
    /**
     * A Pie Chart
     *
     */
    Ext.define('Rally.ui.chart.PieChart', {
        extend: 'Rally.ui.chart.Chart',
        alias: 'widget.rallypiechart',
        requires: ['rallychart'],
        
        config: {
            /**
             * @cfg {String} The config for creating the chart
             */
            chartConfig: {
                series: [
                    {
                        type: 'pie',
                        colorSet: [
                            '#5C9ACB', // blue
                            '#6AB17D', // green
                            '#E5D038', // yellow
                            '#F47168', // red
                            '#E57E3A', // orange
                            '#B5D8EB', // light blue
                            '#B2E3B6', // light green
                            '#FBDE98', // light yellow
                            '#FCB5B1', // light red
                            '#196C89', // dark blue
                            '#3A874F', // dark green
                            '#D9AF4B', // dark yellow
                            '#EF3F35', // dark red
                            '#E0E0E0', // light gray
                            '#ACACAC', // gray
                            '#747474', // dark gray
                            '#B3B79A'  // olive
                        ],
                        field: 'Count',
                        showInLegend: true,
                        highlight: {
                            segment: {
                                margin: 10
                            }
                        },
                        label: {
                            field: 'Name',
                            display: 'none',
                            contrast: true
                        }
                    }
                ]
            }
        },

        initComponent: function() {
            this.callParent(arguments);

            this.addEvents(
            /**
             * @event
             * Fires when a chart piece has been clicked
             * @param {Rally.components.ui.Chart} this
             */
                    "click"
                    );

            this.chartConfig.series[0].listeners = this.chartConfig.series[0].listeners || {};
            Ext.apply(this.chartConfig.series[0].listeners, {
                itemmouseup: this._onClick,
                scope: this
            });
        },

        _getValueField: function() {
            return this.chartConfig.series[0].field;
        },

        _getDisplayField: function() {
            return this.chartConfig.series[0].label.field;
        },

        buildStore: function(data) {

            var data = [];
            var valueField = this._getValueField();
            var displayField = this._getDisplayField();
            var total = 0;

            Ext.Object.each(this.data, function(key, value) {
                var dataPoint = {};
                dataPoint[displayField] = key || "None";
                if (Ext.isArray(value)) {
                    dataPoint[valueField] = value.length;
                } else {
                    dataPoint[valueField] = value;
                }
                total += dataPoint[valueField];
                data.push(dataPoint);
            });

            return total ? Ext.create('Ext.data.JsonStore', {
                fields: [displayField, valueField],
                data: data
            }) : null;
        },

        _onClick: function(item) {
            this.fireEvent('click', this, {
                value: item.storeItem.get(this._getDisplayField()),
                count: item.storeItem.get(this._getValueField()),
                field: this.attribute,
                type: this.type
            });
        }
    });
})();
