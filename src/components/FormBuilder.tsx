import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, Trash2, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Confetti from 'react-confetti'
import { Vansh } from './test'

interface FormField {
  id: string
  type: string
  label: string
  name: string
  placeholder?: string
  description?: string
  isRequired: boolean
  defaultValue: string
  options?: { label: string; value: string; isDefault?: boolean }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'password', label: 'Password' },
  { value: 'select', label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio' },
  { value: 'date', label: 'Date' },
  { value: 'file', label: 'File Upload' },
  { value: 'combobox', label: 'Combobox' },
]

const FieldEditor: React.FC<{
  field: FormField
  updateField: (id: string, updates: Partial<FormField>) => void
  removeField: (id: string) => void
  validateFieldName: (name: string, currentId: string) => boolean
}> = ({ field, updateField, removeField, validateFieldName }) => {
  const validateDefaultValue = (value: string) => {
    if (
      (field.type === 'select' ||
        field.type === 'radio' ||
        field.type === 'combobox') &&
      field.options &&
      value &&
      !field.options.some((option) => option.value === value)
    ) {
      toast.error(
        `Default value must be one of the options for ${field.type} fields.`
      )
      return false
    }
    return true
  }

  const handleDefaultValueChange = (optionValue: string) => {
    const updatedOptions = field.options?.map((option) => ({
      ...option,
      isDefault: option.value === optionValue,
    }))
    updateField(field.id, {
      options: updatedOptions,
      defaultValue: optionValue,
    })
  }

  return (
    <Card className='mb-4 border-2 border-primary/20 hover:border-primary/40 transition-colors'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>
          {field.label ||
            field.type.charAt(0).toUpperCase() + field.type.slice(1)}{' '}
          Field
        </CardTitle>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => removeField(field.id)}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </CardHeader>
      <CardContent>
        <div className='grid gap-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor={`${field.id}-label`} className='text-right'>
              Label
            </Label>
            <Input
              id={`${field.id}-label`}
              value={field.label}
              onChange={(e) => {
                const newLabel = e.target.value
                const newName = newLabel
                  .toLowerCase()
                  .replace(/[^a-z0-9_]/g, '_')
                if (validateFieldName(newName, field.id)) {
                  updateField(field.id, {
                    label: newLabel,
                    name: newName || `field_${field.id}`,
                  })
                } else {
                  toast.error('Field name must be unique')
                }
              }}
              className='col-span-3'
              required
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor={`${field.id}-placeholder`} className='text-right'>
              Placeholder
            </Label>
            <Input
              id={`${field.id}-placeholder`}
              value={field.placeholder || ''}
              onChange={(e) =>
                updateField(field.id, {
                  placeholder: e.target.value || undefined,
                })
              }
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor={`${field.id}-description`} className='text-right'>
              Description
            </Label>
            <Textarea
              id={`${field.id}-description`}
              value={field.description || ''}
              onChange={(e) =>
                updateField(field.id, {
                  description: e.target.value || undefined,
                })
              }
              className='col-span-3'
            />
          </div>
          {field.type !== 'select' &&
            field.type !== 'radio' &&
            field.type !== 'combobox' && (
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor={`${field.id}-default`} className='text-right'>
                  Default Value
                </Label>
                <Input
                  id={`${field.id}-default`}
                  value={field.defaultValue || ''}
                  onChange={(e) => {
                    const newValue = e.target.value
                    if (validateDefaultValue(newValue)) {
                      updateField(field.id, { defaultValue: newValue })
                    }
                  }}
                  className='col-span-3'
                />
              </div>
            )}
          <div className='flex items-center space-x-2'>
            <Switch
              id={`${field.id}-required`}
              checked={field.isRequired}
              onCheckedChange={(checked) =>
                updateField(field.id, { isRequired: checked })
              }
            />
            <Label htmlFor={`${field.id}-required`}>Required</Label>
          </div>
          {(field.type === 'select' ||
            field.type === 'radio' ||
            field.type === 'combobox') && (
            <div className='grid gap-2'>
              <Label>Options</Label>
              {field.options?.map((option, index) => (
                <div key={index} className='flex items-center space-x-2'>
                  <Input
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...(field.options || [])]
                      newOptions[index] = {
                        ...newOptions[index],
                        label: e.target.value,
                        value:
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_]/g, '_') || `option_${index}`,
                      }
                      updateField(field.id, { options: newOptions })
                    }}
                    placeholder='Option label'
                    required
                  />
                  <Switch
                    id={`${field.id}-option-${index}-default`}
                    checked={option.isDefault || false}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleDefaultValueChange(option.value)
                      } else {
                        handleDefaultValueChange('')
                      }
                    }}
                  />
                  <Label htmlFor={`${field.id}-option-${index}-default`}>
                    Default
                  </Label>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => {
                      const newOptions = [...(field.options || [])]
                      newOptions.splice(index, 1)
                      updateField(field.id, { options: newOptions })
                    }}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              ))}
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  const newOptions = [
                    ...(field.options || []),
                    { label: '', value: '', isDefault: false },
                  ]
                  updateField(field.id, { options: newOptions })
                }}
              >
                <Plus className='h-4 w-4 mr-2' /> Add Option
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const generateZodSchema = (
  fields: FormField[],
  isTypeScript: boolean
): string => {
  let schema = 'const formSchema = z.object({\n'
  fields.forEach((field) => {
    let fieldSchema = `  ${field.name}: z.`
    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'password':
      case 'email':
        fieldSchema += 'string()'
        if (field.type === 'email') fieldSchema += '.email()'
        break
      case 'number':
        fieldSchema +=
          'string().refine((val) => !isNaN(Number(val)), { message: "Must be a number" }).transform(Number)'
        break
      case 'date':
        fieldSchema += 'date()'
        break
      case 'checkbox':
        fieldSchema += 'boolean()'
        break
      case 'select':
      case 'radio':
      case 'combobox':
        fieldSchema += `enum([${field.options?.map((o) => `'${o.value}'`).join(', ')}])`
        break
      case 'file':
        fieldSchema += isTypeScript ? 'instanceof(FileList)' : 'any()'
        break
    }
    if (field.isRequired) {
      if (field.type === 'checkbox') {
        fieldSchema += `.refine((val) => val === true, { message: '${field.label || field.name} is required' })`
      } else {
        fieldSchema += `.refine((val) => val !== undefined && val !== null${
          field.type != 'combobox' &&
          field.type != 'radio' &&
          field.type != 'select' &&
          field.type != 'date' &&
          field.type != 'file'
            ? " && val.trim() != ''"
            : ''
        } , { message: '${field.label || field.name} is required' })`
      }
    } else {
      fieldSchema += '.optional()'
    }
    if (field.validation) {
      if (field.validation.min !== undefined) {
        fieldSchema += `.refine((val) => Number(val) >= ${field.validation.min}, { message: 'Must be at least ${field.validation.min}' })`
      }
      if (field.validation.max !== undefined) {
        fieldSchema += `.refine((val) => Number(val) <= ${field.validation.max}, { message: 'Must be at most ${field.validation.max}' })`
      }
      if (field.validation.pattern) {
        fieldSchema += `.regex(new RegExp('${field.validation.pattern}'))`
      }
    }
    schema += fieldSchema + ',\n'
  })
  schema += '})\n'
  return schema
}

const generateFormComponent = (
  formName: string,
  formDescription: string,
  fields: FormField[],
  isTypeScript: boolean,
  isNextJs: boolean
): string => {
  const imports = `import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
${isNextJs ? 'import { useRouter } from "next/navigation"' : ''}

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
`

  const schema = generateZodSchema(fields, isTypeScript)

  const formFields = fields
    .map((field) => {
      let fieldJSX = ''
      switch (field.type) {
        case 'text':
        case 'email':
        case 'password':
        case 'number':
          fieldJSX = `<FormField
          control={form.control}
          name="${field.name}"
          render={({ field })=> (
            <FormItem>
              <FormLabel>${field.label || field.name}</FormLabel>
              <FormControl>
                <Input type="${field.type === 'number' ? 'number' : field.type}" placeholder="${field.placeholder || ''}" {...field} />
              </FormControl>
              ${field.description ? `<FormDescription>${field.description}</FormDescription>` : ''}
              <FormMessage />
            </FormItem>
          )}
        />`
          break
        case 'textarea':
          fieldJSX = `<FormField
          control={form.control}
          name="${field.name}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>${field.label || field.name}</FormLabel>
              <FormControl>
                <Textarea placeholder="${field.placeholder || ''}" {...field} />
              </FormControl>
              ${field.description ? `<FormDescription>${field.description}</FormDescription>` : ''}
              <FormMessage />
            </FormItem>
          )}
        />`
          break
        case 'select':
          fieldJSX = `<FormField
          control={form.control}
          name="${field.name}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>${field.label || field.name}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="${field.placeholder || ''}" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  ${field.options?.map((option) => `<SelectItem value="${option.value}">${option.label}</SelectItem>`).join('\n')}
                </SelectContent>
              </Select>
              ${field.description ? `<FormDescription>${field.description}</FormDescription>` : ''}
              <FormMessage />
            </FormItem>
          )}
        />`
          break
        case 'checkbox':
          fieldJSX = `<FormField
          control={form.control}
          name="${field.name}"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>${field.label || field.name}</FormLabel>
                ${field.description ? `<FormDescription>${field.description}</FormDescription>` : ''}
              </div>
            </FormItem>
          )}
        />`
          break
        case 'radio':
          fieldJSX = `<FormField
          control={form.control}
          name="${field.name}"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>${field.label || field.name}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  ${field.options
                    ?.map(
                      (option) => `
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="${option.value}" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        ${option.label}
                      </FormLabel>
                    </FormItem>`
                    )
                    .join('\n')}
                </RadioGroup>
              </FormControl>
              ${field.description ? `<FormDescription>${field.description}</FormDescription>` : ''}
              <FormMessage />
            </FormItem>
          )}
        />`
          break
        case 'date':
          fieldJSX = `<FormField
          control={form.control}
          name="${field.name}"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>${field.label || field.name}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>${field.placeholder || ''}</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              ${field.description ? `<FormDescription>${field.description}</FormDescription>` : ''}
              <FormMessage />
            </FormItem>
          )}
        />`
          break
        case 'file':
          fieldJSX = `<FormField
          control={form.control}
          name="${field.name}"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>${field.label || field.name}</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                />
              </FormControl>
              ${field.description ? `<FormDescription>${field.description}</FormDescription>` : ''}
              <FormMessage />
            </FormItem>
          )}
        />`
          break
        case 'combobox':
          fieldJSX = `<FormField
          control={form.control}
          name="${field.name}"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>${field.label || field.name}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? ${JSON.stringify(field.options)}.find(
                            (option) => option.value === field.value
                          )?.label
                        : "${field.placeholder || 'Select option'}"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="${field.placeholder || 'Search option...'}" />
                    <CommandEmpty>No option found.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {${JSON.stringify(field.options)}.map((option) => (
                          <CommandItem
                            value={option.label}
                            key={option.value}
                            onSelect={() => {
                              field.onChange(option.value)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                option.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              ${field.description ? `<FormDescription>${field.description}</FormDescription>` : ''}
              <FormMessage />
            </FormItem>
          )}
        />`
          break
      }
      return fieldJSX
    })
    .join('\n')

  const component = `
export function ${formName.replace(/[^a-zA-Z0-9_]/g, '')}() {
  ${isNextJs ? 'const router = useRouter()' : ''}
  const form = useForm${isTypeScript ? '<z.infer<typeof formSchema>>' : ''}({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ${fields
        .map((f) => {
          if (f.type === 'checkbox') {
            return `${f.name}: ${f.defaultValue === 'true'}`
          } else if (f.type === 'date') {
            return `${f.name}: ${f.defaultValue ? `new Date('${f.defaultValue}')` : 'undefined'}`
          } else if (f.type === 'number') {
            return `${f.name}: ${f.defaultValue ? `'${f.defaultValue}'` : 'undefined'}`
          } else if (f.type === 'file') {
            return `${f.name}: undefined`
          } else if (
            f.type === 'combobox' ||
            f.type === 'select' ||
            f.type === 'radio'
          ) {
            const defaultOption = f.options?.find((opt) => opt.isDefault)
            return `${f.name}: ${defaultOption ? `'${defaultOption.value}'` : 'undefined'}`
          } else {
            return `${f.name}: ${f.defaultValue ? `'${f.defaultValue}'` : 'undefined'}`
          }
        })
        .join(',\n      ')}
    },
  })

  function onSubmit(values${isTypeScript ? ': z.infer<typeof formSchema>' : ''}) {
    // TODO: Implement form submission
    console.log(values)
    ${isNextJs ? 'router.push("/success")' : '// Navigate to success page'}
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">${formName}</CardTitle>
        <CardDescription>${formDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            ${formFields}
            <Button type="submit" className="w-full">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
`

  return imports + schema + component
}

export default function FormBuilder() {
  const [formName, setFormName] = useState('My Form')
  const [formDescription, setFormDescription] = useState('')
  const [fields, setFields] = useState<FormField[]>([])
  const [selectedType, setSelectedType] = useState('')
  const [isCodeDisplayOpen, setIsCodeDisplayOpen] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [isTypeScript, setIsTypeScript] = useState(true)
  const [isNextJs, setIsNextJs] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  const validateFieldName = (name: string, currentId: string) => {
    return !fields.some(
      (field) => field.name === name && field.id !== currentId
    )
  }

  const addField = () => {
    if (selectedType) {
      const newField: FormField = {
        id: `field-${Date.now()}`,
        type: selectedType,
        label: '',
        name: `field_${Date.now()}`,
        isRequired: false,
        defaultValue: '',
      }

      if (
        selectedType === 'select' ||
        selectedType === 'radio' ||
        selectedType === 'combobox'
      ) {
        newField.options = [{ label: '', value: '' }]
      }

      setFields([...fields, newField])
      setSelectedType('')
    }
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    )
  }

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id))
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(fields)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setFields(items)
  }

  const handleGenerateCode = () => {
    if (fields.length === 0) {
      toast.error(
        'No fields added. Please add at least one field to generate the form code.'
      )
      return
    }

    const invalidFields = fields.filter(
      (field) =>
        !field.label ||
        (field.options && field.options.some((option) => !option.label))
    )

    if (invalidFields.length > 0) {
      toast.error(
        'Please ensure all fields have labels and all options have values.'
      )
      return
    }

    const code = generateFormComponent(
      formName,
      formDescription,
      fields,
      isTypeScript,
      isNextJs
    )
    setGeneratedCode(code)
    setIsCodeDisplayOpen(true)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode)
    toast.success('Code copied to clipboard')
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 5000)
  }

  useEffect(() => {
    const fieldNames = fields.map((field) => field.name)
    const duplicates = fieldNames.filter(
      (name, index) => fieldNames.indexOf(name) !== index
    )
    if (duplicates.length > 0) {
      toast.error(
        `Duplicate field names detected: ${duplicates.join(', ')}. Please ensure all field names are unique.`
      )
    }
  }, [fields])

  return (
    <div className='container mx-auto py-10 space-y-8 mt-8'>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
        />
      )}
      <Card className='bg-gradient-to-br from-primary/5 to-secondary/5 shadow-lg'>
        <CardHeader>
          <CardTitle className='text-3xl font-bold text-primary'>
            Form Builder
          </CardTitle>
          <CardDescription className='text-lg text-secondary-foreground'>
            Create your custom form with ease
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <Label htmlFor='form-name' className='text-lg font-semibold'>
                Form Name
              </Label>
              <Input
                id='form-name'
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className='text-lg'
              />
            </div>
            <div className='space-y-2'>
              <Label
                htmlFor='form-description'
                className='text-lg font-semibold'
              >
                Description
              </Label>
              <Textarea
                id='form-description'
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className='text-lg'
              />
            </div>
          </div>
          <div className='flex flex-wrap gap-6'>
            <div className='w-full md:w-auto'>
              <Label className='text-lg font-semibold'>Framework</Label>
              <Select
                value={isNextJs ? 'nextjs' : 'react'}
                onValueChange={(value) => setIsNextJs(value === 'nextjs')}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Select framework' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='react'>React</SelectItem>
                  <SelectItem value='nextjs'>Next.js</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='w-full md:w-auto'>
              <Label className='text-lg font-semibold'>Language</Label>
              <Select
                value={isTypeScript ? 'typescript' : 'javascript'}
                onValueChange={(value) =>
                  setIsTypeScript(value === 'typescript')
                }
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Select language' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='javascript'>JavaScript</SelectItem>
                  <SelectItem value='typescript'>TypeScript</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='bg-gradient-to-br from-primary/5 to-secondary/5 shadow-lg'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-primary'>
            Form Fields
          </CardTitle>
          <CardDescription className='text-lg text-secondary-foreground'>
            Add and configure the fields for your form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center space-x-4 mb-6'>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Select field type' />
              </SelectTrigger>
              <SelectContent>
                {fieldTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={addField}
              disabled={!selectedType}
              className='bg-primary text-primary-foreground hover:bg-primary/90'
            >
              Add Field
            </Button>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId='fields'>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className='space-y-4'
                >
                  {fields.map((field, index) => (
                    <Draggable
                      key={field.id}
                      draggableId={field.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className='mb-4'
                        >
                          <div {...provided.dragHandleProps}>
                            <FieldEditor
                              field={field}
                              updateField={updateField}
                              removeField={removeField}
                              validateFieldName={validateFieldName}
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='outline' onClick={() => setFields([])}>
                  Clear All Fields
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove all fields from the form</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            onClick={handleGenerateCode}
            className='bg-primary text-primary-foreground hover:bg-primary/90'
          >
            Generate Form Code
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isCodeDisplayOpen} onOpenChange={setIsCodeDisplayOpen}>
        <DialogContent className='max-w-4xl max-h-[80vh]'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold text-primary'>
              Generated Form Code
            </DialogTitle>
            <DialogDescription className='text-lg text-secondary-foreground'>
              Copy and paste this code into your project to use the generated
              form.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className='h-[60vh] rounded-md border-2 border-primary/20 p-4'>
            <SyntaxHighlighter
              language={isTypeScript ? 'typescript' : 'javascript'}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '1rem',
                fontSize: '0.875rem',
                lineHeight: '1.25rem',
              }}
            >
              {generatedCode}
            </SyntaxHighlighter>
          </ScrollArea>
          <DialogFooter>
            <Button
              onClick={handleCopyCode}
              className='bg-primary text-primary-foreground hover:bg-primary/90'
            >
              <Copy className='mr-2 h-4 w-4' /> Copy Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
