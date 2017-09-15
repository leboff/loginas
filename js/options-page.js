$(function(){
    var options = window.options;
    restoreOptions().then(function(options){
		var unselectedItems = _.reject(userFields, function(item){
			return _.find(options.userFields, item);
		});

		$('[data-aljs="multi-select"]').multiSelect({
			unselectedItems: unselectedItems,
			selectedItems: options.userFields,
			onSelectItem: function(){
				saveOptions($('[data-aljs="multi-select"]').multiSelect('getSelectedItems'));
			},
			onUnselectItem: function(){
				
			}
        });
        
        $('[data-aljs-multi-select="move-up"]').click(function(){
            saveOptions($('[data-aljs="multi-select"]').multiSelect('getSelectedItems'));
        });
        $('[data-aljs-multi-select="move-down"]').click(function(){
            saveOptions($('[data-aljs="multi-select"]').multiSelect('getSelectedItems'));
        });
	})
});