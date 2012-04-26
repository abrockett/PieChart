Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        this.add({
            xtype: 'rallypiechart',
            config: {
                height: 500,
                width: 500,
                type: 'Defect',
                attribute: 'Priority',
                title: 'My Title',
                subtitle: 'My Subtitle',
                emptyText: 'No data'
            }
        });
    }
});
