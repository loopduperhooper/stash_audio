package sqlite

import (
	"math"
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

// modFn implements SQL mod(a, b) without relying on SQLite being compiled
// with the sqlite_math_functions build tag. Operates on floats since the
// random-sort expression can overflow int64, at which point SQLite passes
// the value through as a REAL.
func modFn(a, b float64) (float64, error) {
	if b == 0 {
		return 0, nil
	}
	return math.Mod(a, b), nil
}
