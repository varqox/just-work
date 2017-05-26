Array.prototype.last = function() {
	return this[this.length - 1]
}
HTMLCollection.prototype.last = function() {
	return this[this.length - 1]
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
		stmt.run(beg_time.getFullYear() + '-' + (beg_time.getMonth() + 1)
			+ '-' + beg_time.getDate(),
			beg_time.getHours() + ':' + beg_time.getMinutes(), duration_s, tags_s)
		stmt.finalize()

		db.each("SELECT day, time, duration, tags FROM data", function(err, row) {
			console.log(row.day, row.time, row.duration, row.tags)
		})
	})
	db.close()
}

{
	const graph = document.getElementById('graph')
	var db = new sqlite3.Database('data.db')
	db.serialize(function() {
		var tags = new Map();
		db.all("SELECT day, time, duration, tags FROM data ORDER BY day, time", function(err, rows) {
			for (var row of rows)
				row.tags.split(' ').forEach(function (elem) {
					tags.set(elem, 0)
				})

			const tbody = graph.children[0]
			tbody.innerHTML = '<tr><th>Day</th></tr>' +
				'<tr><th>Begin time</th></tr>' +
				'<tr><th>Duration</th></tr>'

			var n = 3
			for (var [k, v] of tags) {
				tbody.insertAdjacentHTML('beforeend',
					'<tr><th class="marked">' + k + '</th></tr>')
				tags.set(k, n++)
			}

			var last_day = undefined
			for (var row of rows) {
				// Day
				if (row.day !== last_day) {
					for (var elem of tbody.children)
						elem.insertAdjacentHTML('beforeend', '<td class="vl"></td>');

					last_day = row.day
					tbody.children[0].insertAdjacentHTML('beforeend',
						'<td>' + row.day + '</td>')
				} else
					(function (elem) {
						var x = (elem.getAttribute('colspan') || 1) | 0
						elem.setAttribute('colspan', x + 1)
					})(tbody.children[0].children.last())

				// Time
				tbody.children[1].insertAdjacentHTML('beforeend',
					'<td>' + row.time + '</td>')

				// Duration
				var dur = ''
				if (Math.floor(row.duration / 60) !== 0)
					dur += Math.floor(row.duration / 60) + ' m'
				if (dur.length === 0)
					dur += row.duration + ' s'
				else if (row.duration % 60 !== 0)
					dur += ' ' + row.duration % 60 + ' s'

				tbody.children[2].insertAdjacentHTML('beforeend',
					'<td>' + dur + '</td>')

				// Other td
				for (var i = 3; i != tbody.children.length; ++i) {
					var tr = tbody.children[i]
					tr.insertAdjacentHTML('beforeend', '<td>&nbsp;</td>')
				}

				// Mark tags
				row.tags.split(' ').forEach(function(tag) {
					tbody.children[tags.get(tag)].children.last().classList.add('marked')
				})
			}
		})
	})
	db.close()
}
