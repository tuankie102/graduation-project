import { useEffect, useState } from "react";
import { Result } from "antd";
import { useAppSelector } from "@/redux/hooks";
interface IProps {
  hideChildren?: boolean;
  children: React.ReactNode;
  permission: { method: string; apiPath: string; module: string };
}

const Access = (props: IProps) => {
  //set default: hideChildren = false => vẫn render children
  // hideChildren = true => ko render children, ví dụ hide button (button này check quyền)
  const { permission, hideChildren = false } = props;
  const [allow, setAllow] = useState<boolean>(true);

  const { permissions, active } = useAppSelector((state) => {
    console.log(">>>>>>>>>.state.account.user.role", state.account.user.role);
    console.log(
      ">>>>>>>>>.state.account.user.role.active",
      state.account.user.role.active
    );
    return {
      permissions: state.account.user.role.permissions,
      active: state.account.user.role.active,
    };
  });

  useEffect(() => {
    if (active === false) {
      setAllow(false);
    } else if (permissions?.length) {
      console.log(">>>>>>>>>.permissions", permissions);
      console.log(">>>>>>>>>.active", active);
      const check = permissions.find(
        (item) =>
          item.apiPath === permission.apiPath &&
          item.method === permission.method &&
          item.module === permission.module
      );
      if (check) {
        setAllow(true);
      } else setAllow(false);
    }
  }, [permissions, active]);

  return (
    <>
      {allow === true || import.meta.env.VITE_ACL_ENABLE === "false" ? (
        <>{props.children}</>
      ) : (
        <>
          {hideChildren === false ? (
            <Result
              status="403"
              title="Truy cập bị từ chối"
              subTitle="Xin lỗi, bạn không có quyền hạn truy cập thông tin này"
            />
          ) : (
            <>{/* render nothing */}</>
          )}
        </>
      )}
    </>
  );
};

export default Access;
