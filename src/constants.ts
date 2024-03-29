export default {
  urls: {
    homePage: 'http://siiauescolar.siiau.udg.mx/wus/gupprincipal.inicio',
    admission: 'http://siiauescolar.siiau.udg.mx/wal/sgpinfo.ingreso?pidmp=',
    login: 'http://siiauescolar.siiau.udg.mx/wus/gupprincipal.valida_inicio',
    careerParams: 'http://siiauescolar.siiau.udg.mx/wal/SGPPROC.DOBLE_CARRERA',
    student: 'http://siiauescolar.siiau.udg.mx/wal/SGPHIST.FICHA_DC',
  },
  selectors: {
    login: {
      code: 'input[name=p_codigo_c]',
      nip: 'input[name=p_clave_c]',
      button: 'input[type=submit]',
    },
    home: {
      validator: 'Bienvenido al Sistema SIIAU - Escolar',
      studentsLink: "//a[text()= 'ALUMNOS']",
      academicLink: "//a[contains(., 'ACADÉMICA')]",
      studentInfo: "//a[contains(., 'Ficha')]",
      studentGrades: "//a[contains(., 'Boleta')]",
      studentKardex: "//a[contains(., 'Kárdex')]",
      admissionLink: "//a[contains(., 'Ingreso')]",
      registerLink:
        "//a[contains(., 'REGISTRO') and not(contains(., 'PRERREGISTRO'))]",
      scheduleLink: "//a[contains(., 'Horario')]",
      paymentOrderLink: "//a[contains(., 'Orden De Pago')]",
      hasMoreCareersValidator:
        'El alumno tiene mas de una carrera registrada. Selecciona la carrera con la que vas a trabajar.',
      selectCareerCell: '/html/body/table/tbody/tr[{i}]/td[2]',
      btnCareerValidator: '/html/body/table/tbody/tr[{i}]/td[8]/input',
    },
    studentInfo: {
      code: '/html/body/div[3]/table/tbody/tr[2]/td[1]',
      name: '/html/body/div[3]/table/tbody/tr[2]/td[2]',
      status: '/html/body/div[3]/table/tbody/tr[3]/td[1]',
      degree: '/html/body/div[3]/table/tbody/tr[3]/td[2]',
      admissionDate: '/html/body/div[3]/table/tbody/tr[3]/td[3]',
      lastCalendar: '/html/body/div[3]/table/tbody/tr[3]/td[4]',
      career: '/html/body/div[3]/table/tbody/tr[4]/td',
      campus: '/html/body/div[3]/table/tbody/tr[5]/td',
      location: '/html/body/div[3]/table/tbody/tr[6]/td',
      validator: 'Ficha técnica del estudiante',
      v1: {
        code: 'body > div:nth-child(12) > table > tbody > tr:nth-child(2) > td:nth-child(2)',
        name: 'body > div:nth-child(12) > table > tbody > tr:nth-child(2) > td:nth-child(4)',
        status:
          'body > div:nth-child(12) > table > tbody > tr:nth-child(3) > td:nth-child(2)',
        degree:
          'body > div:nth-child(12) > table > tbody > tr:nth-child(3) > td:nth-child(4)',
        admissionDate:
          'body > div:nth-child(12) > table > tbody > tr:nth-child(3) > td:nth-child(6)',
        lastCalendar:
          'body > div:nth-child(12) > table > tbody > tr:nth-child(3) > td:nth-child(8)',
        career:
          'body > div:nth-child(12) > table > tbody > tr:nth-child(4) > td',
        campus:
          'body > div:nth-child(12) > table > tbody > tr:nth-child(5) > td',
        location:
          'body > div:nth-child(12) > table > tbody > tr:nth-child(6) > td',
      },
    },
    studentProgress: {
      cell: '/html/body/div[5]/table[1]/tbody/tr[{i}]/td[{j}]',
      totalCell: '/html/body/div[5]/table[1]/tbody/tr[{i}]/th[{j}]',
      regularCells: {
        1: 'calendar',
        2: 'admission',
        3: 'career',
        4: 'campus',
        5: 'campusAlt',
        6: 'gpa',
        7: 'credits',
        8: 'percentage',
      },
      totalCells: {
        6: 'totalGpa',
        7: 'totalCredits',
        8: 'totalPercentage',
      },
      v1: {
        table: 'body > div:nth-child(19) > table:nth-child(2)',
      },
    },
    studentGrades: {
      validator: 'Boleta de calificaciones',
      cell: '/html/body/div/div[4]/table/tbody/tr[{i}]/td[{j}]',
      cells: {
        1: 'nrc',
        2: 'subjectId',
        3: 'subject',
        4: 'grade',
        5: 'isInKardex',
        6: 'grade',
        7: 'isInKardex',
      },
    },
    studentKardex: {
      validator: 'Nombre de la materia',
      calendarHeading: '//*[@id="leyendaPromedio"]/table[1]/tbody/tr[{i}]/th',
      table: '//*[@id="leyendaPromedio"]/table[1]',
      calendarHeadingValidator: 'Calendario {1}',
      calendarAll: 'Calendario ',
      cell: '//*[@id="leyendaPromedio"]/table[1]/tbody/tr[{j}]/td[{k}]',
      cells: {
        1: 'nrc',
        2: 'subjectId',
        3: 'subject',
        4: 'grade',
        5: 'type',
        6: 'credits',
        7: 'date',
      },
    },
    credits: {
      summary: {
        required: '//*[@id="leyendaPromedio"]/table[2]/tbody/tr[2]/td[1]',
        aquired: '//*[@id="leyendaPromedio"]/table[2]/tbody/tr[3]/td',
        left: '//*[@id="creditosFaltantesID"]',
      },
      detailed: {
        cell: '//*[@id="leyendaPromedio"]/table[2]/tbody/tr[{i}]/td[{j}]',
      },
    },
    admission: {
      validator: 'Escuela de procedencia',
      cell: '/html/body/div[2]/div[2]/table/tbody/tr[{i}]/td[{j}]',
      cells: {
        1: 'calendar',
        2: 'schoolOfOrigin',
        3: 'admissionType',
        4: 'gpaSchoolOfOrigin',
        5: 'admissionTestScore',
        6: 'admissionScore',
        7: 'personalContribution',
        8: 'career',
      },
      v1: {
        table: 'body > div:nth-child(4) > div:nth-child(3) > table',
      },
    },
    studentSchedule: {
      validator: 'PROFESOR',
      select: '#cicloID',
      lastCalendar: '//*[@id="cicloID"]/option[2]',
      cell: '/html/body/center[2]/div[2]/table/tbody/tr[{i}]/td[{j}]',
      cells: {
        1: 'nrc',
        2: 'subjectId',
        3: 'subject',
        4: 'section',
        5: 'credits',
        6: 'timePeriod',
        13: 'building',
        14: 'classroom',
        15: 'teacher',
        16: 'dateOfStart',
        17: 'dateOfEnd',
      },
      cellsExtra: {
        2: 'timePeriod',
        9: 'building',
        10: 'classroom',
        11: 'teacher',
        12: 'dateOfStart',
        13: 'dateOfEnd',
      },
    },
    payment: {
      validator: 'Estado de Cuenta del Estudiante',
      cell: '/html/body/table[1]/tbody/tr[3]/td/table/tbody/tr[{i}]/td[{j}]',
      cells: {
        1: 'account',
        2: 'concept',
        3: 'description',
        4: 'date',
        5: 'expirationDate',
        6: 'amount',
        total: 'total',
      },
    },
  },
};
