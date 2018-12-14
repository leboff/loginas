$(function(){
    var options = window.options;
    restoreOptions().then(function(options){
		var unselectedItems = _.reject(userFields, function(item){
			return _.find(options.userFields, item);
		});

		if(options.standardUsersOnly){
			$('#standard-users').prop('checked', true);
		}
		else{
			$('#standard-users').prop('checked', false);
		}

		$('[data-aljs="multi-select"]').multiSelect({
			unselectedItems: unselectedItems,
			selectedItems: options.userFields,
			onSelectItem: function(){
				saveOptions({userFields: $('[data-aljs="multi-select"]').multiSelect('getSelectedItems')});
			},
			onUnselectItem: function(){
				
			}
        });
        
        $('[data-aljs-multi-select="move-up"]').click(function(){
            saveOptions({userFields: $('[data-aljs="multi-select"]').multiSelect('getSelectedItems')});
        });
        $('[data-aljs-multi-select="move-down"]').click(function(){
            saveOptions({userFields: $('[data-aljs="multi-select"]').multiSelect('getSelectedItems')});
		});
		$('#standard-users').change(function(){
			saveOptions({standardUsersOnly: $(this).is(":checked")})
		})
	})
});