## SIIAU api

**We do not store student IDs nor passwords on our servers, this is a stateless api**

This project exposes a RESTful API for retrieving information from the SIIAU system.

If you want to see the api specification, you can refer to https://siiau-api.herokuapp.com/api

Note: For every request you need to send headers `x-student-code` and `x-student-nip` to authenticate the user to the system.

### Exposed endpoints

**`/student`**

Will retrieve the general info about the student
