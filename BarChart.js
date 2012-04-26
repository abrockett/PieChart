(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * A Bar Chart
     *
     */
    Ext.define('Rally.ui.chart.BarChart', {
        extend: 'Rally.ui.chart.Chart',
        alias: 'rallybarchart',
        requires: ['rallychart'],

        config: {

            /**
             * @cfg {String} The config for creating the chart
             */
            chartConfig: {
                legend: false,
                axes: [
                    {
                        type: 'Numeric',
                        position: 'left',
                        fields: ['Count'],
                        grid: true,
                        majorTickSteps: true
                    },
                    {
                        type: 'Category',
                        position: 'bottom',
                        fields: ['Name']
                    }
                ],
                series: [
                    {
                        type: 'column',
                        axis: 'left',
                        column: true,
                        xField: 'Name',
                        yField: 'Count',
                        xPadding: 10,
                        yPadding: 1,
                        highlight: true,
                        //color renderer
                        renderer: function(sprite, record, attr, index, store) {
                            return Ext.apply(attr, {
                                fill: [
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
                                ][index]
                            });
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

        buildStore: function(data) {

            var data = [];
            var valueField = 'Count';//this.chartConfig.series[0].field;
            var displayField = 'Name';//this.chartConfig.series[0].label.field;
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
                value: item.value[0],
                count: item.value[1],
                field: this.attribute,
                type: this.type
            });
        }
    });
})();
