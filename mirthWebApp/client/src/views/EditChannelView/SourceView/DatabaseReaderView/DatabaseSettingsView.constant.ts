export const DRIVER_TYPES = [
  { value: 'blank', label: 'Please Select One' },
  { value: 'com.mysql.cj.jdbc.Driver', label: 'MySQL' },
  { value: 'oracle.jdbc.driver.OracleDriver', label: 'Oracle' },
  { value: 'org.postgresql.Driver', label: 'PostgreSQL' },
  {
    value: 'net.sourceforge.jtds.jdbc.Driver',
    label: 'SQL Server /Sybase (jTDS)'
  },
  {
    value: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
    label: 'Microsoft SQL Server'
  },
  { value: 'org.sqlite.JDBC', label: 'SQLite' },
  { value: 'custom', label: 'Custom' }
];
