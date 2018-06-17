	// $(function() {
	// 		$('#loadContract_output').on('change', 'select', function(){
	// 			let selected = $(this).find(':selected');
	// 			let action = selected.text(); 
	// 			let data = selected.data('fields');
	// 			console.log(data)
	// 			let markup = '<form class="pure-form pure-form-stacked">';
	// 			markup += `<input type="hidden" name="contract_action" value="${action}">`;
	// 			data.forEach(function(field){
	// 				markup += `
	// 					<label for="${field.name}">
	// 				      ${field.name}<input type="text" name="${field.name}" placeholder="${field.type}" autocomplete="off">
	// 				    </label>`;

	// 			})
	// 			markup +='<button data-event= \'["test"]\' class="pure-button button-success">Execute</button>'
	// 			markup +='<form>';
	// 			$('.output2').hide().html(markup).fadeIn();
	// 		})
	// });


$(function() {
	var slideout = new Slideout({
			'panel': document.getElementById('panel'),
			'menu': document.getElementById('menu'),
			'padding': 256,
			'tolerance': 70
	});
	document.querySelector('.toggle-button').addEventListener('click', function() {
		slideout.toggle();
	});

	$('.logo').on('click',()=> window.location.hash = '#default');
});

