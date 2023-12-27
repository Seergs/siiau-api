**NO LONGER MAINTAINED: siiau has improved security and all api endpoints will fail with Unauthorized error message**

<p align="center">An HTTP API for quickly retrieving information from the SIIAU system</p>

**We do not store student IDs nor passwords on our servers, this is a stateless API**

Note: For every request you need to send headers `x-student-code` and `x-student-nip` to authenticate the user to the system.

### Information we can retrieve for you:

- If the student credentials are correct (login)
- Student general information (career, level, status, etc)
- Grades of the student based on calendar, including those not in Kardex yet
- The progress percentage of the student in the career
- Credits information (required, acquired, left, split by type, etc)
- Information about the admission (gpa from the school of origin, score of the admision test, etc)
- Student schedule
- Payment order information

### Example

```bash
curl <API_HOST>/student --header "x-student-code:217758497" --header "x-student-nip:<siiau_nip>"
```

Will return a JSON like the following:
```json
{
  "code": "217758497",
  "name": "SERGIO SUAREZ ALVAREZ",
  "campus": "CENTRO UNIVERSITARIO DE CIENCIAS EXACTAS E INGENIERIAS",
  "career": "INGENIERIA EN COMPUTACION (INCO)",
  "degree": "LICENCIATURA",
  "status": "GRADUADO SIN SERVICIO SOCIAL",
  "location": "CAMPUS TECNOLOGICO GDL",
  "lastCalendar": "2021B",
  "admissionDate": "2017B"
}
```

### Known issues

- Sometimes there is an error when trying to find some element from the page, still trying to find the bug, just re-make the request for now
- If the student has a survey to complete, then some operations like kardex (grades) will fail
- New requests take a long time to complete since we are doing scrapping to get the data. If a request is made again to the same endpoint with the same input (studentCode, studentNip, same query params, etc) then the request will finish instantly since we are caching responses for 10 minutes.
- Schedule endpoint fails when schedule dropdown has not options.
- ~~Currently if the user has multiple careers in SIIAU, some functionality will fail, like the retrieval of the grades and the general student information.~~ **Fixed**

If you find any bug or problem, please raise a GitHub issue and I will take a look.
