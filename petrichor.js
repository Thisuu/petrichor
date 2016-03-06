password_prompt = false;
selected_user = null;
time_remaining = 0

function show_prompt(text, type)
{
	password_prompt = true;
	label = document.getElementById('password_label');
	label.innerHTML = text;

	users = document.getElementById('users');
	for (i in users.children)
	{
		user = users.children[i];
		if (user.id != ('user_' + selected_user) && user.style != null)
			user.style.opacity = 0.1;
	}

	entry = document.getElementById('password_entry');
	entry.value = '';

	var selected = document.getElementById("user_" + selected_user);
	rect = selected.getBoundingClientRect();
	cont = document.getElementById('password_container');

	cont.style.top = rect.top;
	if (cont.style.left != rect.right)
		cont.style.left = rect.right;
	cont.classList.add('shown');

	entry.focus();
}

function show_message(text, type)
{
	cont = document.getElementById('message_container');
	document.getElementById('message_label').innerHTML = text;

	if (text.length > 0)
	{
		var selected = document.getElementById("user_" + selected_user);
		rect = selected.getBoundingClientRect();

		cont.style.top = rect.top;
		if (cont.style.left != rect.right)
			cont.style.left = rect.right;
		cont.style.top = rect.top;
		cont.classList.add("shown");
	} else {
		cont.classList.remove("shown");
	}
}

function reset()
{
	users = document.getElementById('users');
	for (i in users.children)
	{
		child = users.children[i];
		if (child.style != null)
			child.style.opacity = 1;
	}
	document.getElementById('password_container').classList.remove("shown");
	password_prompt = false;
}

function authentication_complete()
{
	sel = document.getElementById('session_list');
	session = sel.options[sel.selectedIndex].getAttribute('data-sid');
	if (lightdm.is_authenticated)
		lightdm.start_session_sync(lightdm.authentication_user, session);
	else
		show_message('<span class="error-icon">&#x26A0;</span> Authentication Failed');

	reset();
}

function start_authentication(username)
{
	document.getElementById('message_container').classList.remove("shown");

	if (!password_prompt) {
		selected_user = username;
		lightdm.authenticate(username);
	}
}

function provide_secret()
{
	entry = document.getElementById('password_entry');
	lightdm.respond(entry.value);
}

function autologin_timer_expired(username)
{
	lightdm.authenticate(lightdm.autologin_user);
}

function countdown()
{
	label = document.getElementById('countdown_label');
	label.innerHTML = ' in ' + time_remaining + ' seconds';
	time_remaining--;
	if (time_remaining >= 0)
		setTimeout('countdown()', 1000);
}

function build_session_list()
{
	slist = document.getElementById('session_list');
	slist.innerHTML = "";
	for (session of lightdm.sessions)
	{
		slist.innerHTML += "<option data-sid="+session.key+">"+session.name+"</option>";
	}
}

function update_time()
{
	var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
	var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
	var d = new Date();
	niceHours = d.getHours();
	niceMinutes = d.getMinutes();
	// I'm yearning for strftime
	if (niceHours < 10)
		niceHours = "0"+niceHours;
	if (niceMinutes < 10)
		niceMinutes = "0"+niceMinutes;
	document.getElementById('date').innerHTML = days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()];
	document.getElementById('time').innerHTML = niceHours + ":" + niceMinutes;
	setTimeout('update_time()', 1000);
}

function start()
{
	document.write('<div id="users">');
	for (i in lightdm.users)
	{
		user = lightdm.users[i];

		if (user.image.match(/\.face$/))
			image = '/usr/share/icons/Adwaita/256x256/emotes/face-laugh.png';
		else
			image = user.image;

		document.write('<a href="#" class="user" id="user_' + user.name +'" onclick="start_authentication(\'' + user.name + '\')">');
		document.write('<img class="avatar" src="file:///' + image + '" /><span class="name">'+user.display_name+'</span>');

		if (user.name == lightdm.autologin_user && lightdm.autologin_timeout > 0)
			document.write('<span id="countdown_label"></span>');

		document.write('</a>');
	}
	document.write('</div>');

	time_remaining = lightdm.autologin_timeout;
	if (time_remaining > 0)
		countdown();
}

function load()
{
	update_time();
	build_session_list();
}
