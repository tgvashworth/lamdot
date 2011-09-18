var local=(function(key){var store=window.localStorage;return{get:function(){try{return JSON.parse(store[key])}catch(e){return []}},put:function(o){try{store[key]=JSON.stringify(o)}catch(e){return false}},raw:function(){try{return store[key]}catch(e){return false}},putRaw:function(s){try{store[key]=s}catch(e){return false}},reset:function(){store[key]={}}}}("home10k"));if(local.get()===null)local.put([]);
function cleanUrl(str,reverse){if(reverse===undefined)reverse=false;if(!reverse){return encodeURIComponent($.trim(str+" "))}else{return decodeURIComponent($.trim(str+" "))}}function cleanText(str){return $.trim(str+" ").replace(/[<>\/\\]/gi,'')}function stripSlashes(str){return $.trim(str+" ").replace(/[\/\\]/gi,'')}function shorten(url,cb){$.get('http://api.bitly.com/v3/shorten?login=phuu&apiKey=R_72773b90287b62a0e0ab20c756f2d600&format=json&longUrl='+url,function(data){cb(data)})}function exportLinks(cb){shorten(cleanUrl(window.location.href+'?links='+local.raw()),cb)}
// Dear reader: Apologies that this is so damn ugly, but it's gotta be teeeny-tiny see?
$(document).ready(function() {
	var search = window.location.search,	body = $('body')
	if(search.indexOf("links") !== -1) {
		var links = search.replace(/\?links=/,'')
		local.putRaw(cleanUrl(links,true))
		if(history) {
			history.pushState(null, null, window.location.origin + window.location.pathname)
			body.addClass('import')
		} else {
			search = "import" }
	} else if( search.indexOf("import") !== -1 ) {
		body.addClass('import')
	} else if(local.get().length < 1) {
    body.addClass($('#help').attr("role"))
    local.put([{t:"Gmail",l:"//mail.google.com",c:0},{t:"Twitter",l:"//twitter.com",c:0},{t:"Docs",l:"//docs.google.com",c:0}]) }
	var lib = {more: '<span class="aside">(more links here)</span>',	rmv: 'Remove a link', cncl: 'Cancel', imfail: 'Gah, failed. Sorry!'}
	$("#closewelcome").click(function(e) { e.preventDefault(); $("#welcome").slideUp() })
	function sortlinks(a,b){return b.c-a.c}
	function refresh () {
    var links = local.get(), sorted = links.sort(sortlinks), buf = '', topnum = (links.length > 3 ? 3 : links.length)
    for(var i=0; i < topnum; i++) {	buf += '<a href="'+sorted[i].l+'" target="_blank">'+sorted[i].t+'</a>' };$("#top").html(buf)
    buf = '';for(var i=topnum,l=links.length; i < l; i++) { buf += '<a href="'+sorted[i].l+'" target="_blank">'+sorted[i].t+'</a>' };$("#others").html((buf != '' ? buf : lib.more)) }
	function resetForm(){ $("#text").val("");$("#link").val("")}
	var remove = false
	function toggleRemove(){$('#remove').text(($('#remove').text() === lib.rmv ? lib.cncl : lib.rmv));remove = (remove ? false : true);body.toggleClass("remove") }
	function clearExport() {$('#search input').val('');$('#short').fadeOut('fast')}
	function clearImport() {body.removeClass('import')}
	$('.links a').live('click', function(e) {
    e.preventDefault()
		var links = local.get(), url = ''
    if(remove === false) {
      for(var i=0,l=links.length; i < l; i++) {
        if(links[i].t === $(this).text()) {
          url = links[i].l
          links[i].c += 1
        }
      }
      local.put(links);setTimeout(function() { window.location.href = url }, 0)
    } else {
      for(var i=0,l=links.length; i < l; i++) {
        if(links[i].t === $(this).text() && confirm("Are you sure you wish to delete the "+links[i].t+" to "+links[i].l+"? This cannot be undone.")) {
          $(this).fadeOut(function() {$(this).remove()})
					links.splice(i, 1)
					break } }
			local.put(links);toggleRemove();refresh() }
  })
  $('#doadd').click(function(e) {
    e.preventDefault()
		var text = $('#text').val(), link = $('#link').val(), links = local.get(), dupe = false	
		if(text == '' || link == '') return false
    text = stripSlashes(cleanText(text)), link = '//'+link.replace(/.*\/\//, '','gi')
    for(var i=0,l=links.length; i < l; i++) {
      if(links[i].l === link || links[i].t === text) {
        dupe = true
				break } }
    if(dupe === false) {
      links.push({t: text, l: link, c: 1})
      local.put(links) }
    $("#new").click()
		resetForm()
    refresh() })
	$('header nav a').click(function(e) {
		e.preventDefault()
		clearExport()
		clearImport()
		body.toggleClass($(this).attr('role'))
		$(this).siblings('a').each(function() { $('body').removeClass($(this).attr('role')) }) })
	$('#closeadd').click(function(e) {e.preventDefault();body.toggleClass($('#new').attr('role')) })
	$('.bigheart').click(function(e) {e.preventDefault();body.toggleClass($(this).attr('role'))})
	$('#export').click(function(e){e.preventDefault();exportLinks(function(data){if(data.status_code === 200) {$('#search input').val(data.data.url).focus().select()} else {$('#search input').val(lib.imfail)};$('#short').fadeIn('fast')})})
  $('#remove').click(function(e){e.preventDefault();toggleRemove()})
  $('#reset').click(function (e) {e.preventDefault();if(confirm("This will restore your link set to the default three, and you cannot undo it. Are you sure?")) {local.reset();window.location.reload()}})
  resetForm();refresh();$('#search input').focus()
})