function pad(number, width) {
	const x = String(number);
	return '0'.repeat(width - x.length) + x;
}

const sqlite3 = require('sqlite3-offline').verbose()
function save(beg_time, duration_s, tags) {
	var db = new sqlite3.Database('data.db')
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS data (day, time, duration, tags)")

		var tags_s = ''
		for (let x of tags)
			tags_s += (tags_s.length === 0 ? '' : ' ') + x.innerText;

		var stmt = db.prepare("INSERT INTO data VALUES (?, ?, ?, ?)")
		stmt.run(beg_time.getFullYear() + '-' + pad(beg_time.getMonth() + 1, 2)
			+ '-' + pad(beg_time.getDate(), 2),
			pad(beg_time.getHours(), 2) + ':' + pad(beg_time.getMinutes(), 2), duration_s, tags_s)
		stmt.finalize()

		db.each("SELECT day, time, duration, tags FROM data", function(err, row) {
			console.log(row.day, row.time, row.duration, row.tags)
		})
	})
	db.close()
}

const ipc = require('electron').ipcRenderer
const BrowserWindow = require('electron').remote.BrowserWindow
const path = require('path')

document.getElementById('begin-work').addEventListener('click', function(event) {
	const duration = document.getElementById('duration');
	duration.style.display = 'none';

	document.body.insertAdjacentHTML('beforeend',
		'<center id="countdown">' +
			'<p id="time-left"></p>' +
			'<button id="cancel">Cancel</button>' +
		'</center>')

	const countdown = document.getElementById('countdown')

	const cancel = document.getElementById('cancel')
	cancel.addEventListener('click', function (event) {
		this.parentNode.outerHTML = ''
		document.getElementById('duration').style.display = 'block'
	})

	const dur = {
		hours: parseInt(document.getElementsByName('hours')[0].value),
		minutes: parseInt(document.getElementsByName('minutes')[0].value),
		seconds: parseInt(document.getElementsByName('seconds')[0].value)
	};

	const duration_s = ((dur.hours * 60 + dur.minutes) * 60 + dur.seconds);

	const beg_time = new Date;
	const end_time = Date.now() + duration_s * 1000;

	function update_countdown() {
		const left = Math.max(0, end_time - Date.now());

		let x = left + 500; // Round seconds properly
		try {
			document.getElementById('time-left').innerText = 'Time left: '
				+ pad(Math.floor(x / 3600000), 2) + ':'
				+ pad(Math.floor(x / 60000) % 60, 2) + ':'
				+ pad(Math.floor(x / 1000) % 60, 2);

			if (left === 0) { // Timeout
				cancel.outerHTML = ''

				// Play sound
				let win = new BrowserWindow({ show: false })
				win.loadURL('file://' + path.join(__dirname, 'play_bell.html'))
				win.on('closed', function() { win = null })

				setTimeout(function(){
					window.addEventListener('click', function() { win.close() },
						{once: true})
				}, 0)

				countdown.insertAdjacentHTML('beforeend', '<center id="success">' +
						'<p><span>Time is over!</span></p>' +
						'<div>Select applying tags:</div>' +
						'<span>Learning</span>' +
						'<span>Programming</span>' +
						'<span>Debug</span>' +
						'<span>Research</span>' +
						'<span>Other</span>' +
					'</center>' +
					'<button id="save">Save</button>');

				document.querySelectorAll('#success > span').forEach(function(elem) {
					elem.addEventListener('click', function() {
						this.classList.toggle('checked')
					})
				})

				document.getElementById('save').addEventListener('click', function() {
					var tags = document.querySelectorAll('#success > span.checked')
					countdown.outerHTML = ''
					duration.style.display = 'block'
					save(beg_time, duration_s, tags)
				})

				return;
			}

			x = left % 1000;
			setTimeout(update_countdown, (x === 0 ? 1000 : x));
		} catch (e) {}
	}

	update_countdown()
})
