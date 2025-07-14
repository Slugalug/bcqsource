var captchaResponse = null;
function correctCaptcha(response) {
    captchaResponse = response;
}
var _captchaTries = 0;
function recaptchaOnload() {
    _captchaTries++;
    if (_captchaTries > 9)
        return;
    $('.g-recaptcha2').each(function (index, el) {
        grecaptcha.render(el, {
            'sitekey': $(el).attr('data-sitekey'),
            'callback': function (response) {
                correctCaptcha(response);
            },
            'expired-callback': function () {
                setTimeout(function () {
                    grecaptcha.reset();
                }, 1000);
            },
        });
    });
}
