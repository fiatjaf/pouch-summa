[![Travis CI status](https://travis-ci.org/fiatjaf/pouch-summa.svg)](https://travis-ci.org/fiatjaf/pouch-summa)

## not working correctly:

* responding to new properties added (poor support with Object.observe and untested with Proxy) -- this is unsolvable unless Proxy is implemented on more browsers.
* responding to deleted properties (can work with poor support like above, but still doesn't).
* perhaps we should have `.set` and `.del` acessor methods.
