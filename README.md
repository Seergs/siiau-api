<p align="center">A RESTful API for quickly retrieving information from the SIIAU system</p>

**We do not store student IDs nor passwords on our servers, this is a stateless API**

If you want to see the complete API specification, please see the [API reference](https://siiau-api.herokuapp.com/api)

Note: For every request you need to send headers `x-student-code` and `x-student-nip` to authenticate the user to the system.

### Information we can retrieve for you:

- If the student credentials are correct (login)
- Student general information (career, level, status, etc)
- Grades of the student based on calendar, including those not in Kardex yet
- The progress percentage of the student in the career
- Credits information (required, aquired, left, split by type, etc)
- Information about the admission (gpa from the school of origin, score of the admision test, etc)
- Student schedule

### Known issues

- Sometimes there is an error when trying to find some element from the page, still trying to find the bug, just re-make the request for now
- If the student has a survey to complete, then some operations like kardex (grades) will fail
