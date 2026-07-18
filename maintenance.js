/* =============================================
   SICHTSCHUTZ
   Setzt SICHTSCHUTZ_AKTIV auf true, um die Seite
   hinter einem Overlay zu verstecken.
   ============================================= */
var SICHTSCHUTZ_AKTIV = false;

(function () {
    if (!SICHTSCHUTZ_AKTIV) return;

    // Detect saved theme preference
    var theme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

    // Colors per theme (matching style.css)
    var dark = {
        bg: '#1e2024',
        text: '#c8cad0',
        muted: '#7d818a',
        accent: '#8a9bae',
        border: '#33363e'
    };
    var light = {
        bg: '#cdced1',
        text: '#3a3d44',
        muted: '#5e6168',
        accent: '#4e6380',
        border: '#b8bbc0'
    };
    var c = theme === 'light' ? light : dark;
    // Build overlay
    var overlay = document.createElement('div');
    overlay.id = 'sichtschutz-wall';
    overlay.setAttribute('style', [
        'position:fixed',
        'inset:0',
        'z-index:2147483647',
        'display:flex',
        'flex-direction:column',
        'align-items:center',
        'justify-content:center',
        'background:' + c.bg,
        'color:' + c.text,
        'font-family:"DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        'text-align:center',
        'padding:2rem',
        'overflow:hidden'
    ].join(';'));

    overlay.innerHTML =
        '<h1 style="font-family:\'Barlow Condensed\',\'Arial Narrow\',Arial,sans-serif;' +
            'font-size:clamp(1.6rem,5vw,2.8rem);font-weight:700;letter-spacing:.02em;' +
            'line-height:1.2;margin-bottom:1rem;color:' + c.text + '">' +
            'gerade ist ganz schlecht!' +
        '</h1>' +
        '<p style="font-size:clamp(.95rem,2.5vw,1.15rem);color:' + c.muted + ';max-width:28em;line-height:1.6">' +
            'Die Seite wird gerade &uuml;berarbeitet und ist vor&uuml;bergehend nicht erreichbar.' +
        '</p>';

    // Hide everything else as soon as possible
    var style = document.createElement('style');
    style.textContent =
        'body>*:not(#sichtschutz-wall){display:none!important}' +
        'body{overflow:hidden!important;background:' + c.bg + '!important}';

    // Inject immediately (works even in <head>)
    (document.head || document.documentElement).appendChild(style);

    // Inject overlay as soon as <body> exists
    function inject() {
        if (document.body) {
            document.body.prepend(overlay);
        } else {
            requestAnimationFrame(inject);
        }
    }
    inject();
})();
