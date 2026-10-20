"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { PlusIcon, SearchIcon } from "lucide-react"

import { ButtonPlus } from "../ui/button-plus"
import { CheckboxPlus, CheckboxPlusGroup } from "../ui/checkbox-plus"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { InputPlus, InputPlusPassword, InputPlusSearch, InputPlusTextArea } from "../ui/input-plus"
import { RadioPlusGroup } from "../ui/radio-plus"
import { SwitchPlus } from "../ui/switch-plus"

export function ButtonPlusDemo() {
  const [loading, setLoading] = useState(false)
  return (
    <div className="grid max-w-md gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <ButtonPlus>默认</ButtonPlus>
        <ButtonPlus variant="outline">描边</ButtonPlus>
        <ButtonPlus variant="ghost">幽灵</ButtonPlus>
        <ButtonPlus variant="link">链接</ButtonPlus>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ButtonPlus
          icon={<PlusIcon />}
          loading={loading}
          onClick={() => {
            setLoading(true)
            window.setTimeout(() => setLoading(false), 800)
          }}
        >
          保存
        </ButtonPlus>
        <ButtonPlus icon={<PlusIcon />} aria-label="添加" />
        <ButtonPlus danger>危险</ButtonPlus>
        <ButtonPlus danger variant="outline">
          危险描边
        </ButtonPlus>
        <ButtonPlus danger variant="ghost">
          危险幽灵
        </ButtonPlus>
      </div>
      <ButtonPlus block>整行按钮</ButtonPlus>
    </div>
  )
}

export function InputPlusDemo() {
  const [keyword, setKeyword] = useState("效果")
  return (
    <div className="grid max-w-md gap-3">
      <InputPlus allowClear prefix={<SearchIcon />} suffix="px" placeholder="带前后缀" />
      <InputPlus showCount maxLength={12} placeholder="最多 12 字" />
      <InputPlus status="error" placeholder="错误" defaultValue="无效" />
      <InputPlus status="warning" placeholder="警告" />
      <InputPlusPassword placeholder="密码" />
      <InputPlusSearch value={keyword} onValueChange={setKeyword} onSearch={setKeyword} />
      <InputPlusTextArea autoSize={{ minRows: 2, maxRows: 4 }} showCount maxLength={40} placeholder="自适应高度" />
      <NameField />
    </div>
  )
}

function NameField() {
  const form = useForm<{ name: string }>({ defaultValues: { name: "" } })
  return (
    <Form {...form}>
      <form className="grid gap-2" onSubmit={form.handleSubmit(() => undefined)}>
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "请填写名称" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>名称</FormLabel>
              <FormControl>
                <InputPlus value={field.value} onValueChange={field.onChange} onBlur={field.onBlur} ref={field.ref} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <ButtonPlus htmlType="submit" className="w-fit">
          提交校验
        </ButtonPlus>
      </form>
    </Form>
  )
}

export function SwitchPlusDemo() {
  const [on, setOn] = useState(true)
  return (
    <div className="flex flex-wrap items-center gap-4">
      <SwitchPlus checked={on} onCheckedChange={setOn} checkedChildren="开" unCheckedChildren="关" />
      <SwitchPlus size="sm" defaultChecked />
      <SwitchPlus loading defaultChecked />
    </div>
  )
}

export function CheckboxPlusDemo() {
  const [value, setValue] = useState<string[]>(["docs"])
  return (
    <div className="grid gap-4">
      <CheckboxPlus indeterminate>全选</CheckboxPlus>
      <CheckboxPlusGroup
        options={["docs", { label: "registry", value: "registry" }, { label: "禁用", value: "off", disabled: true }]}
        value={value}
        onValueChange={setValue}
      />
      <CheckboxPlusGroup orientation="vertical" options={["上", "下"]} defaultValue={["上"]} />
    </div>
  )
}

export function RadioPlusDemo() {
  const [city, setCity] = useState("hangzhou")
  return (
    <div className="grid gap-4">
      <RadioPlusGroup
        options={[
          { label: "杭州", value: "hangzhou" },
          { label: "宁波", value: "ningbo" },
          { label: "禁用", value: "off", disabled: true },
        ]}
        value={city}
        onValueChange={setCity}
      />
      <RadioPlusGroup optionType="button" options={["日", "周", "月"]} defaultValue="周" />
      <RadioPlusGroup orientation="vertical" options={["左", "右"]} defaultValue="左" />
    </div>
  )
}
