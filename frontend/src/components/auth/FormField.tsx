const FormField = ({ label, htmlFor, children }) => {
  return (
    <div className="field-wrap">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  )
}

export default FormField
