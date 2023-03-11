{
	let liblocation = '/common/lib/';
	[
		//load dependencies
		//	some devices dont have allsettled... this is why we are not using addGlobalReferenceGroup
		liblocation+'allsettled-polyfill',
		liblocation+'md5',
		liblocation+'taffy-min',
		
		//next part...
		'/common/js/scripts2'
	].forEach((path)=>{
		addGlobalReference(0, path, {defer: false});
	});
}