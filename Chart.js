(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * A Chart
     *
     */
    Ext.define('Rally.ui.chart.Chart', {
        extend: 'Ext.container.Container',
        cls: 'chart',
        alias: 'rallychart',
        config: {
            /**
             * @cfg {Number} height The height of the chart
             */
            height: 300,

            /**
             * @cfg {Number} width The width of the chart
             */
            width: 300,

            /**
             * @cfg {String} type The type to query (HierarchicalRequirement, Defect, etc)
             */
            type: undefined,

            /**
             * @cfg {String} attribute The attribute on the specified type from which to build the chart
             * (ScheduleState, State, etc)
             */
            attribute: undefined,

            /**
             * @cfg {String} title The chart title
             */
            title: undefined,

            /**
             * @cfg {String} subtitle The chart subtitle
             */
            subtitle: undefined,

            /**
             * @cfg {String} emptyText The message to display when there is no data
             */
            emptyText: 'No data',

            /**
             * @cfg {String} The config for creating the chart
             */
            chartConfig: {
                legend: {
                    position: 'right'
                },
                insetPadding: 20,
                animate: true,
                theme: 'Base:gradients',
                series: [],
                axes: []
            },

            /**
             * @cfg {Object} The config for accessing data
             * (Specify filters, context here)
             */
            storeConfig: {
                filters: []
            }
        },

        items: [
            {
                xtype: 'component',
                itemId: 'title',
                cls: 'title'
            },
            {
                xtype: 'component',
                itemId: 'subtitle',
                cls: 'subtitle'
            },
            {
                xtype: 'container',
                itemId: 'chart',
                cls: 'chart'
            }
        ],

        /**
         * @constructor
         * @param {Object} config
         */
        constructor: function(config) {
            this.initConfig(config);
            this.callParent(arguments);
        },

        onDestroy: function() {
            if (this.chart) {
                this.chart.destroy();
                delete this.chart;
            }

            this.callParent(arguments);
        },

        initComponent: function() {
            this.callParent(arguments);

            this.addEvents(

            /**
             * @event
             * Fires when the chart has been rendered.
             * @param {Rally.components.ui.Chart} this
             */
                    "load",

            /**
             * @event
             * Fires when the allowed values have been retrieved.
             * @param {Rally.components.ui.Chart} this
             */
                    "valuesRetrieved",

            /**
             * @event
             * Fires when the chart data has been retrieved.
             * @param {Rally.components.ui.Chart} this
             */
                    "dataRetrieved");

            this.on('afterrender', this._onLoad, this);
        },

        _onLoad: function() {
            if (!this.title) {
                this.down('#title').hide();
            } else {
                this.down('#title').update(this.title);
            }

            if (!this.subtitle) {
                this.down('#subtitle').hide();
            } else {
                this.down('#subtitle').update(this.subtitle);
            }

            if (this.values) {
                if (this.data) {
                    this._renderChart();
                } else {
                    this._showWait();
                    this._runObjectQuery();
                }
            } else {
                this._showWait();
                this._runAllowedValuesQuery();
            }
        },

        _showWait: function() {
            //TODO:
            //this.wait = Ext.create('Rally.components.basic.Wait', {
            //    renderTo: this.down('#chart').getEl()
            //});
        },

        _runObjectQuery: function(typeModel) {
            this.model = typeModel;
            var field = typeModel.getField(this.attribute);
            if (field) {
                this.allowedValues = Ext.Array.pluck(field.allowedValues, "StringValue");
                this.fireEvent("valuesRetrieved", this, {
                    values: this.allowedValues
                });
            } else {
                //TODO: error
            }

            //TODO: handle ref types (release, owner, etc.)

            this._runQuery();

        },

        _runAllowedValuesQuery: function() {
            Rally.data.ModelFactory.getModel({
                type: this.type,
                success: this._runObjectQuery,
                //TODO: failure
                scope: this
            });
        },

        _buildStores: function() {
            //TODO: Currently this brings back all the data.
            //(Past version used adhoc and placeholder queries)

            var stores = [];
            Ext.each(this.allowedValues, function(allowedValue) {

                var wsapiStoreConfig = Ext.apply({
                    fetch: [this.attribute],
                    model: this.model,
                    pageSize: 200, //TODO: Currently this brings back only one page worth of data,
                    value: allowedValue
                }, this.storeConfig);


                var filter = new Rally.data.QueryFilter({
                    property:this.attribute,
                    operator: "=",
                    value : allowedValue
                });
                if (allowedValue === "") {
                    filter = filter.or(new Rally.data.QueryFilter({
                        property:this.attribute,
                        operator: "=",
                        value : "None"
                    }));
                }

                wsapiStoreConfig.filters = [filter].concat(wsapiStoreConfig.filters || []);

                stores.push(new Rally.data.WsapiDataStore(wsapiStoreConfig));
            }, this);

            return stores;
        },

        _runQuery: function() {

            this.data = {};

            function gatherStores(store) {
                this.data[store.value] = store.getItems();
                outstandingQueries--;
                if (!outstandingQueries) {
                    this.fireEvent("dataRetrieved", this, {
                        data: this.data
                    });
                    this._renderChart(this.data);
                }
            }

            var stores = this._buildStores();
            var outstandingQueries = stores.length;

            if (stores.length) {
                Ext.each(stores, function(store) {
                    this.data[store.value] = [];
                    store.on("load", Ext.bind(gatherStores, this), this);
                    store.load();
                }, this);
            } else {
                this._renderChart();
            }
        },

        buildStore: Ext.emptyFn,

        _renderChart: function() {

            if (this.wait) {
                this.wait.destroy();
                delete this.wait;
            }

            var store = this.buildStore(this.data);

            var chartConfig = Ext.apply({
                width: this.width,
                height: this.height,
                store: store
            }, this.chartConfig);

            if (store) {
                this.down('#chart').add(Ext.create('Ext.chart.Chart', chartConfig));
            } else {
                //Show no data text
                this.down('#chart').add({
                    xtype: 'component',
                    cls: 'empty',
                    html: this.emptyText
                });
            }

            this.fireEvent("load", this, {
                data: this.data,
                values: this.allowedValues
            });
        }
    });
})();

