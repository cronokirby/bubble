Every Bubble has a unique identifier, which we call a _BubbleID_.

This identifier is a 64-bit integer (unsigned, since we care only about the bits).
The bits composing it look like:

| 63 to 4           | 3 to 0 |
| ----------------- | ------ |
| UNIX Milliseconds | Noise  |

Looking at it as hex, a 64-bit integer has 16 (4 groups of 4) hex digits:

```
0xFFFF_FFFF_FFFF_FFFF
```

The least-significant digit serves as noise, and the most-significant 15 serve
as a UNIX timestamp, in milliseconds.

For reference, these 60 bits represent a timestamp as the number of milliseconds since January 1st, 1970,
at midnight. Or, using ISO8601 (my personal preference, we have): `1970-01-01T00:00:00.000Z`.

With `2^60` possible timestamps, we get about 36 million years worth of timestamps, so by the time we run out,
maybe we'll have found a better language than C for low-level programming.

The noise bits are (or should be) randomly generated, and should serve to differentiate different timestamps
generated at the same time.
