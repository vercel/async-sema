async-sema
==========

This is a semaphore implementation for use with async-await. The implementation
follows the traditional definition of a semaphore rather than the definition of
an asynchronous semaphore. Where as the latter one generally allows every
defined task to proceed immediately and synchronizes at the end, async-sema
allows only a selected number of tasks to proceed at once while the rest will
remain waiting.

Async-sema manages the semaphore count as a list of tokens instead of a single
variable containing the nuber of available resources. This enables an
interesting application of managing the actual resources with the semaphore
object itself. To make it practical the constructor for Sema includes an option
for providing an init function for the semaphore tokens. Use of a custom token
initializer is demonstrated in `example1.js`.
