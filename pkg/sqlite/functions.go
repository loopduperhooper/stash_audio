package sqlite

import (
	"path/filepath"
	"strconv"
	"strings"
)

func durationToTinyIntFn(str string) (int64, error) {
	splits := strings.Split(str, ":")

	if len(splits) > 3 {
		return 0, nil
	}

	seconds := 0
	factor := 1
	for len(splits) > 0 {
		// pop the last split
		var thisSplit string
		thisSplit, splits = splits[len(splits)-1], splits[:len(splits)-1]

		thisInt, err := strconv.Atoi(thisSplit)
		if err != nil {
			return 0, nil
		}

		seconds += factor * thisInt
		factor *= 60
	}

	return int64(seconds), nil
}

func basenameFn(str string) (string, error) {
	return filepath.Base(str), nil
}

// randomSortKeyFn computes a pseudo-random ordering key for random sort:
// ((n+seed)^2 * p1 + (n+seed) * p2) mod p3
// (see https://stackoverflow.com/questions/21949795#comment33255354_21949859).
// The polynomial is evaluated with the intermediate values reduced mod p3
// after each multiplication, rather than computed in SQL and reduced at the
// end. p3 is below 2^31, so every multiplicand here stays below 2^31 and
// every product stays well within int64 range - unlike the raw expression,
// which overflows int64 for any non-zero seed, silently drops to a float64
// REAL, and loses enough precision that mod() stops being a bijection
// (rows with different ids can round to the same sort key, breaking
// randomness and pagination stability).
func randomSortKeyFn(n, seed int64) (int64, error) {
	const p1 = 52959209
	const p2 = 1047483763
	const p3 = 2147483647

	t := (n + seed) % p3
	if t < 0 {
		t += p3
	}

	t2 := (t * t) % p3
	term1 := (t2 * p1) % p3
	term2 := (t * p2) % p3

	return (term1 + term2) % p3, nil
}
